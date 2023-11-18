package cbir

import (
	"encoding/json"
	"fmt"
	"image"
	"image/color"
	_ "image/jpeg"
	_ "image/png"
	"math"
	"os"
	"path/filepath"
	"sort"
	"sync"
)

type ImgComp struct {
	URL        string  `json:"url"`
	Contrast   float64 `json:"contrast"`
	Homogenity float64 `json:"homogenity"`
	Entropy    float64 `json:"entropy"`
}

type ImgSim struct {
	URL        string  `json:"path"`
	Similarity float64 `json:"percentage"`
}

type GlcmMatrix struct {
	occMtrx             [][]float64
	lowerBound, sizeOcc int
}

type GrayImg struct {
	grayScale           [][]uint8
	widthImg, heightImg int
	minGray, rangeGray  uint8
}

var textureArr []ImgComp

func MakeTexture(url string) ImgComp {
	ImgGray := MakeGray(url)
	glcm := MakeOcc(ImgGray, 1, 0)
	imgComp := MakeImgComp(glcm)
	imgComp.URL = filepath.Base(url)
	return imgComp
}

func ListFiles(root string) ([]os.DirEntry, error) {
	dirEntries, err := os.ReadDir(root)
	if err != nil {
		return nil, err
	}

	var files []os.DirEntry
	for _, entry := range dirEntries {
		files = append(files, entry)
	}
	return files, nil
}

func MakeJSONDataset(root, dest string) {
	files, err := ListFiles(root)
	if err != nil {
		fmt.Printf("error listing files in directory %v: %v\n", root, err)
		return
	}

	var wg sync.WaitGroup
	var mu sync.Mutex
	var prosesFile = make(map[string]bool)
	for _, entry := range files {
		fp := filepath.Join(root, entry.Name())
		mu.Lock()
		if _, processed := prosesFile[fp]; !processed {
			prosesFile[fp] = true
			mu.Unlock()
			wg.Add(1)
			go func(fp string) {
				defer wg.Done()
				imgComp := MakeTexture(fp)
				mu.Lock()
				textureArr = append(textureArr, imgComp)
				mu.Unlock()
			}(fp)
		} else {
			mu.Unlock()
		}
	}
	wg.Wait()

	file, err := os.OpenFile(dest, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0644)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	err = encoder.Encode(textureArr)
	if err != nil {
		fmt.Println("Error encoding JSON:", err)
		return
	}
}

func MakeGray(url string) GrayImg {
	var imG GrayImg
	inputFile, err := os.Open(url)
	if err != nil {
		fmt.Println("Error opening image:", err)
		return imG
	}
	defer inputFile.Close()

	img, _, err := image.Decode(inputFile)
	if err != nil {
		fmt.Println("Error decoding image sini:", err)
		return imG
	}

	var minGray, maxGray uint8 = 255, 0
	size := img.Bounds().Size()

	var grayScale [][]uint8
	for i := 0; i < size.Y; i++ {
		var colArr []uint8
		for j := 0; j < size.X; j++ {
			pixelColor := img.At(i, j)
			rgbaColor := color.RGBAModel.Convert(pixelColor).(color.RGBA)
			colGray := uint8(0.29*float64(rgbaColor.R) + 0.587*float64(rgbaColor.G) + 0.114*float64(rgbaColor.B))
			if colGray > maxGray {
				maxGray = colGray
			}
			if colGray < minGray {
				minGray = colGray
			}
			colArr = append(colArr, colGray)
		}
		grayScale = append(grayScale, colArr)
	}

	imG.grayScale = grayScale
	imG.minGray = minGray
	imG.rangeGray = maxGray - minGray + 1
	imG.widthImg = size.X
	imG.heightImg = size.Y

	return imG
}

func MakeOcc(imG GrayImg, xOffset, yOffset int) GlcmMatrix {
	var glcm GlcmMatrix
	glcm.sizeOcc = int(imG.rangeGray)
	glcm.lowerBound = int(imG.minGray)

	for i := 0; i < glcm.sizeOcc; i++ {
		var rowArr []float64
		for j := 0; j < int(imG.rangeGray); j++ {
			rowArr = append(rowArr, 0)
		}
		glcm.occMtrx = append(glcm.occMtrx, rowArr)
	}

	for i := 0; i < imG.heightImg; i++ {
		for j := 0; j < imG.widthImg; j++ {
			grayFirst := imG.grayScale[i][j]
			neighborY := i + yOffset
			neighborX := j + xOffset
			neighborValid := neighborX < imG.widthImg && neighborY < imG.heightImg && neighborX >= 0 && neighborY >= 0
			if neighborValid {
				graySecond := imG.grayScale[neighborY][neighborX]
				glcm.occMtrx[grayFirst-imG.minGray][graySecond-imG.minGray] += 1
			}
		}
	}

	glcmValue := 0
	for i := 0; i < glcm.sizeOcc; i++ {
		for j := 0; j < glcm.sizeOcc; j++ {
			glcmValue += int(glcm.occMtrx[i][j])
		}
	}

	for i := 0; i < glcm.sizeOcc; i++ {
		for j := 0; j < glcm.sizeOcc; j++ {
			glcm.occMtrx[i][j] /= float64(glcmValue)
		}
	}
	return glcm
}

func MakeImgComp(glcm GlcmMatrix) ImgComp {
	var ImgTemp ImgComp
	for i := 0; i < glcm.sizeOcc; i++ {
		for j := 0; j < glcm.sizeOcc; j++ {
			if glcm.occMtrx[i][j] > 0 {
				ImgTemp.Contrast += glcm.occMtrx[i][j] * float64((i-j+2*glcm.lowerBound)*(i-j+2*glcm.lowerBound))
				ImgTemp.Homogenity += glcm.occMtrx[i][j] / (float64(1 + (i-j+2*glcm.lowerBound)*(i-j+2*glcm.lowerBound)))
				ImgTemp.Entropy -= glcm.occMtrx[i][j] * math.Log10(glcm.occMtrx[i][j])
			}
		}
	}
	return ImgTemp
}

func ImgCompLength(imgComp ImgComp) float64 {
	return (math.Sqrt(math.Pow(imgComp.Contrast, 2) + math.Pow(imgComp.Entropy, 2) + math.Pow(imgComp.Homogenity, 2)))
}

func CosineSimilarity(img1 ImgComp, img2 ImgComp) float64 {
	var cosineSim float64 = (img1.Contrast * img2.Contrast) + (img1.Homogenity * img2.Homogenity) + (img1.Entropy * img2.Entropy)
	cosineSim /= (ImgCompLength(img1) * ImgCompLength(img2))
	return cosineSim
}

func TextureSimilarity(url, pathDATA string) ([]ImgSim, int) {
	var similarity []ImgSim
	file, err := os.Open(pathDATA)
	if err != nil {
		fmt.Println("error1")
		return similarity, 0
	}
	defer file.Close()

	var texture []ImgComp
	decoder := json.NewDecoder(file)
	err = decoder.Decode(&texture)
	if err != nil {
		fmt.Println("error2")
		return similarity, 0
	}
	imgComp := MakeTexture(url)
	var countData int
	for _, val := range texture {
		var sim ImgSim
		sim.Similarity = CosineSimilarity(imgComp, val)
		if sim.Similarity > 0.6 {
			countData += 1
			sim.URL = val.URL
			similarity = append(similarity, sim)
		}
	}

	sort.Slice(similarity, func(i, j int) bool {
		return similarity[i].Similarity > similarity[j].Similarity
	})

	return similarity, countData
}
