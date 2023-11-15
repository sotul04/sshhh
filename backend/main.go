package main

import (
	"archive/zip"
	colorcbir "backend/colorcbir"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"fmt"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(config))
	r.POST("/upload-zip", handleZip)
	r.POST("/search", handleFileUpload)
	r.Run(":8080")
}

func handleFileUpload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error uploading file"})
		return
	}

	// Generate a unique filename for the uploaded file
	fileName := fmt.Sprintf("%s%s", filepath.Base(file.Filename), filepath.Ext(file.Filename))
	dst := filepath.Join("../image", fileName)

	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error saving file"})
		return
	}

	colorcbir.SearchImageColor(dst, "../dataset_vector/color.json", "../result/color_result.json")

	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully"})
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

	err = os.RemoveAll("../assets/")
	if err != nil {
		c.JSON(http.StatusAlreadyReported, gin.H{"error": err.Error()})
		return
	}

	err = extractFiles("../temp/dataset.zip", "../assets")
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

	//Ekstraksi Vektor untuk color dari gambar
	colorcbir.PreproccessImageColor("../assets", "../dataset_vector/color.json")

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
