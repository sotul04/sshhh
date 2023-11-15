package colorcbir

import (
	"encoding/json"
	"fmt"
	"image"
	"image/color"
	_ "image/jpeg"
	_ "image/png"
	"io/fs"
	"log"
	"math"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"sync"
)

// Extraction and Searching

func ConvertHSV(paint color.Color) (float64, float64, float64) {
	r, g, b, _ := paint.RGBA()
	R := float64(r>>8) / 255
	G := float64(g>>8) / 255
	B := float64(b>>8) / 255
	v := math.Max(R, math.Max(G, B))
	min := math.Min(R, math.Min(G, B))
	delta := v - min
	var s, h float64
	if v == 0 {
		s = 0
	} else {
		s = delta / v
	}
	if delta == 0 {
		h = 0
	} else if v == R {
		h = (G - B) / delta
		if h < 0 {
			h += 6
		}
	} else if v == G {
		h = (B-R)/delta + 2
	} else {
		h = (R-G)/delta + 4
	}
	h *= 60
	return h, s, v
}

func IndexHSV(paint color.Color) int32 {
	h, s, v := ConvertHSV(paint)
	var H, S, V int32
	if h >= 316 && h <= 360 {
		H = 0
	} else if h >= 1 && h <= 25 {
		H = 1
	} else if h >= 25 && h <= 40 {
		H = 2
	} else if h >= 40 && h <= 120 {
		H = 3
	} else if h >= 120 && h <= 190 {
		H = 4
	} else if h >= 190 && h <= 270 {
		H = 5
	} else if h >= 270 && h <= 295 {
		H = 6
	} else if h >= 295 && h <= 315 {
		H = 7
	} else {
		H = 0
	}
	if s < 0.2 {
		S = 0
	} else if s < 0.7 {
		S = 1
	} else {
		S = 2
	}
	if v < 0.2 {
		V = 0
	} else if v < 0.7 {
		V = 1
	} else {
		V = 2
	}
	return H*9 + S*3 + V
}

func LengDorm(bins [72]int32) float64 {
	var temp float64 = 0
	for i := 0; i < 72; i++ {
		temp += float64(bins[i]) * float64(bins[i])
	}
	ret := math.Sqrt(temp)
	return ret
}

func ReadImage(path string) image.Image {
	f, err := os.Open(path)
	if err != nil {
		fmt.Println(err)
		return nil
	}
	img, _, err := image.Decode(f)
	if err != nil {
		fmt.Println(err)
		return nil
	}
	return img
}

type Vektor struct {
	ImgName string        `json:"imgName"`
	Bins    [16][72]int32 `json:"bins"`
}

// Extraction File Preproccessing
func CalculateVectorThread(path string, resultChan chan Vektor, wg *sync.WaitGroup) {
	defer wg.Done()
	img := ReadImage(path)
	var vektor Vektor
	if img == nil {
		fmt.Println("Image is not extracted.")
		return
	}
	vektor.ImgName = path
	var width, height int
	size := img.Bounds().Size()
	width = (size.X) / 4
	height = (size.Y) / 4
	currBlock := 0
	for i := 0; i < 4; i++ {
		for j := 0; j < 4; j++ {
			for x := i * width; x < (i+1)*width; x++ {
				for y := j * height; y < (j+1)*height; y++ {
					index := IndexHSV(img.At(x, y))
					vektor.Bins[currBlock][index]++
				}
			}
			currBlock++
		}
	}
	select {
	case resultChan <- vektor:
	default:
	}
}

func CreateDataExtraction(dirpath string) []Vektor {
	runtime.GOMAXPROCS(11)
	var data []Vektor
	maxProccess := 299
	var resultChan = make(chan Vektor, maxProccess)
	var wg sync.WaitGroup
	listFiles, length := ListImageInDir(dirpath)
	fmt.Println("Banyak data:", length)
	count := 0
	for _, path := range listFiles {
		if IsImage(path) {
			wg.Add(1)
			go CalculateVectorThread(dirpath+"/"+path.Name(), resultChan, &wg)
			count++
		}
		if (count)%(maxProccess) == 0 || count == length {
			wg.Wait()
			close(resultChan)
			// Menggabungkan hasil dari goroutine ke dalam slice sementara
			for res := range resultChan {
				data = append(data, res)
			}
			resultChan = make(chan Vektor, maxProccess)
		}
	}
	return data
}

func PreproccessImageColor(dirpath string, destFile string) {
	data := CreateDataExtraction(dirpath)

	file, err := os.Create(destFile)
	if err != nil {
		fmt.Println("Error creating file:", err)
		return
	}
	defer file.Close()

	encoder := json.NewEncoder(file)

	err = encoder.Encode(data)
	if err != nil {
		fmt.Println("Error encoding JSON:", err)
		return
	}
	fmt.Printf("Data written to %v\n", destFile)
}

func IsImage(file fs.DirEntry) bool {
	extent := strings.ToLower(filepath.Ext(file.Name()))
	return extent == ".jpg" || extent == ".jpeg" || extent == ".png"
}

func ListImageInDir(dirpath string) ([]fs.DirEntry, int) {
	files, err := os.ReadDir(dirpath)
	if err != nil {
		fmt.Println("Read Error")
		log.Fatal(err)
		return nil, 0
	}
	count := 0
	for _, file := range files {
		if IsImage(file) {
			count++
		}
	}
	return files, count
}

// Searching Image Color
func CalculateSingleVector(path string) [16][72]int32 {
	img := ReadImage(path)
	var vektor [16][72]int32
	if img == nil {
		fmt.Println("Image is not extracted.")
		return vektor
	}
	var width, height int
	size := img.Bounds().Size()
	width = (size.X) / 4
	height = (size.Y) / 4
	currBlock := 0
	for i := 0; i < 4; i++ {
		for j := 0; j < 4; j++ {
			for x := i * width; x < (i+1)*width; x++ {
				for y := j * height; y < (j+1)*height; y++ {
					index := IndexHSV(img.At(x, y))
					vektor[currBlock][index]++
				}
			}
			currBlock++
		}
	}
	return vektor
}

func ExtractColorVector(filePath string) []Vektor {
	file, err := os.Open(filePath)
	var temp []Vektor
	if err != nil {
		fmt.Println("Error decoding JSON:", err)
		return temp
	}
	defer file.Close()
	decoder := json.NewDecoder(file)
	err = decoder.Decode(&temp)
	if err != nil {
		fmt.Println("Error decoding")
		return temp
	}
	return temp
}

type tuplePercentage struct {
	Path       string  `json:"path"`
	Percentage float64 `json:"percentage"`
}

type ByPercentage []tuplePercentage

func (a ByPercentage) Len() int           { return len(a) }
func (a ByPercentage) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ByPercentage) Less(i, j int) bool { return a[i].Percentage > a[j].Percentage }

func SearchImageColor(imageSearched string, binsFile string, targetFile string) {
	runtime.GOMAXPROCS(11)
	mainVector := CalculateSingleVector(imageSearched)
	dataVector := ExtractColorVector(binsFile)
	length := len(dataVector)
	fmt.Println("Banyak data :", length)
	maxProccess := 299
	var tempFoundImage []tuplePercentage
	resultChan := make(chan tuplePercentage, maxProccess)
	var wg sync.WaitGroup
	for i, fileName := range dataVector {
		wg.Add(1)
		go CosineSimiliarity(mainVector, fileName, resultChan, &wg)
		if (i+1)%(maxProccess) == 0 || (i+1) == length {
			wg.Wait()
			close(resultChan)
			for res := range resultChan {
				tempFoundImage = append(tempFoundImage, res)
			}
			resultChan = make(chan tuplePercentage, maxProccess)
		}
	}
	var finalImage []tuplePercentage
	for _, tuple := range tempFoundImage {
		//fmt.Println(tuple)
		if tuple.Percentage >= 60 {
			finalImage = append(finalImage, tuple)
		}
	}
	sort.Sort(ByPercentage(finalImage))

	fmt.Println("Banyak gambar yang ditemukan:", len(finalImage))

	file, err := os.Create(targetFile)
	if err != nil {
		fmt.Println("Error creating file:", err)
		return
	}
	defer file.Close()

	encoder := json.NewEncoder(file)

	err = encoder.Encode(finalImage)
	if err != nil {
		fmt.Println("Error encoding JSON:", err)
		return
	}
	fmt.Printf("Data written to %v\n", targetFile)
}

func CosineSimiliarity(bins1 [16][72]int32, data Vektor, resultChan chan tuplePercentage, wg *sync.WaitGroup) {
	defer wg.Done()
	var down1 [16]float64
	var down2 [16]float64
	var accum [16]float64
	for i := 0; i < 16; i++ {
		down1[i] = LengDorm(bins1[i])
		down2[i] = LengDorm(data.Bins[i])
	}
	//fmt.Printf("%v %v ----- ", down1, down2)
	var finalRes float64 = 0
	for k := 0; k < 16; k++ {
		for i := 0; i < 72; i++ {
			accum[k] += float64(bins1[k][i]) * float64(data.Bins[k][i])
		}
		finalRes += accum[k] / (down1[k] * down2[k])
	}
	finalRes = finalRes * 100 / 16
	var res tuplePercentage
	res.Path = data.ImgName
	res.Percentage = finalRes
	select {
	case resultChan <- res:
	default:
	}
}
