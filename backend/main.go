package main

import (
	"archive/zip"
	"backend/cbir"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.Use(cors.Default())
	r.POST("/upload-zip", handleZip)
	r.POST("/search-color", handleSearchColor)
	r.POST("/search-texture",handleTexture)
	r.GET("/scrape/*url", func(c *gin.Context) {
		rawUrl := c.Param("url")
		if rawUrl != "" {
			// Ensure the URL starts correctly
			if !strings.HasPrefix(rawUrl, "http://") && !strings.HasPrefix(rawUrl, "https://") {
				// Trim the leading slash if present
				rawUrl = strings.TrimPrefix(rawUrl, "/")
				// Prepend the scheme
				rawUrl = "http://" + rawUrl
			}
	
			if err := scrapeWebsite(rawUrl); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": err.Error(),
				})
				return
			}
			cbir.PreproccessImageColor("../public/dataset", "../dataset_vector/color.json")
			cbir.MakeJSONDataset("../public/dataset","../dataset_vector/texture.json")
			c.JSON(http.StatusOK, gin.H{
				"status": "Image scraping successful",
			})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "URL is required",
			})
		}
	})
	r.Run(":8080")
}

func removeAllFilesInDir(dir string) error {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return err
	}

	for _, entry := range entries {
		// Skip directories
		if entry.IsDir() {
			continue
		}

		filePath := filepath.Join(dir, entry.Name())
		err := os.Remove(filePath)
		if err != nil {
			return err
		}
	}
	return nil
}

func scrapeWebsite(urlString string) error {
	response, err := http.Get(urlString)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	doc, err := goquery.NewDocumentFromReader(response.Body)
	if err != nil {
		return err
	}
	removeAllFilesInDir("../public/dataset")
	doc.Find("img").Each(func(i int, s *goquery.Selection) {
		src, exists := s.Attr("src")
		if exists {
			absoluteSrc := resolveURL(src, urlString)
			if err = downloadImages(absoluteSrc); err != nil {
				// Log error and continue with next image
				log.Printf("Error downloading image: %s", err)
			}
		}
	})
	return nil
}

func downloadImages(imageURL string) error {
	response, err := http.Get(imageURL)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	fileName := filepath.Join("../public/dataset", filepath.Base(imageURL))
	file, err := os.Create(fileName)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = io.Copy(file, response.Body)
	return err
}

func resolveURL(src, baseURL string) string {
	// Resolve relative URLs to absolute
	resolvedURL, err := url.Parse(src)
	if err != nil {
		log.Printf("Error parsing URL: %s", err)
		return src
	}
	base, err := url.Parse(baseURL)
	if err != nil {
		log.Printf("Error parsing base URL: %s", err)
		return src
	}
	return base.ResolveReference(resolvedURL).String()
}


func handleTexture(c *gin.Context){
	file,err := c.FormFile("file")
	if err!= nil{
		c.JSON(http.StatusBadRequest, gin.H{"error":"Unable to save file on server"})
		return
	}
	filename := filepath.Join("../image",file.Filename)
	if err:= c.SaveUploadedFile(file,filename); err!=nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Unable to save file on server"})
		return
	}

	sim,countData := cbir.TextureSimilarity(filename,"../dataset_vector/texture.json")
	for _,val := range sim{
		fp := filepath.Join("../dataset",val.URL)
		val.URL = fp
		val.Similarity *= 100
	}
	c.JSON(http.StatusOK,gin.H{
		"length":countData,
		"data":sim,
	})
}

func handleSearchColor(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error uploading file"})
		return
	}

	// Generate a unique filename for the uploaded file
	fileName := filepath.Base(file.Filename)
	dst := filepath.Join("../image", fileName)

	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error saving file"})
		return
	}

	info := cbir.SearchImageColor(dst, "../dataset_vector/color.json", "../result/color_result.json")
	fmt.Println(len(info))

	responseData := gin.H{
		"length": len(info),
		"data":   info,
	}

	c.JSON(http.StatusOK, responseData)
}

func handleZip(c *gin.Context) {
	_, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get the zip file from the form data
	zipFile, _, err := c.Request.FormFile("zipFile")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Zip file not provided"})
		return
	}
	defer zipFile.Close()

	// Generate a unique folder name using UUID

	// Create a folder in assets
	assetsFolderPath := "../temp/"
	err = os.MkdirAll(assetsFolderPath, 0755)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Save the zip file to the assets folder
	zipFilePath := filepath.Join(assetsFolderPath + "dataset.zip")
	out, err := os.Create(zipFilePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer out.Close()

	_, err = io.Copy(out, zipFile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	err = os.RemoveAll("../public/dataset")
	if err != nil {
		c.JSON(http.StatusAlreadyReported, gin.H{"error": err.Error()})
		return
	}

	err = extractFiles("../temp/dataset.zip", "../public/dataset")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Tutup file setelah selesai mengekstrak
	out.Close()

	err = os.Remove("../temp/dataset.zip")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	//Ekstraksi Vektor untuk color dan texture dari gambar
	cbir.PreproccessImageColor("../public/dataset", "../dataset_vector/color.json")
	cbir.MakeJSONDataset("../public/dataset","../dataset_vector/texture.json")

	c.JSON(http.StatusOK, gin.H{"message": "Zip file uploaded and saved successfully"})
}

func extractFiles(zipFilePath, destinationFolder string) error {
	r, err := zip.OpenReader(zipFilePath)
	if err != nil {
		return err
	}
	defer r.Close()

	for _, file := range r.File {
		filePath := filepath.Join(destinationFolder, file.Name)

		if file.FileInfo().IsDir() {
			// Buat folder jika tidak ada
			os.MkdirAll(filePath, os.ModePerm)
			continue
		}

		// Buat folder untuk file jika tidak ada
		err := os.MkdirAll(filepath.Dir(filePath), os.ModePerm)
		if err != nil {
			return err
		}

		// Buka file di zip
		zipFile, err := file.Open()
		if err != nil {
			return err
		}
		defer zipFile.Close()

		// Buat file di sistem
		newFile, err := os.Create(filePath)
		if err != nil {
			return err
		}
		defer newFile.Close()

		// Salin isi file
		_, err = io.Copy(newFile, zipFile)
		if err != nil {
			return err
		}
	}

	return nil
}
