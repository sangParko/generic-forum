package util

import (
	"archive/tar"
	"compress/gzip"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"
)

func Exists(path string) (bool, error) {
	_, err := os.Stat(path)
	if err == nil { return true, nil }
	if os.IsNotExist(err) { return false, nil }
	return false, err
}

func WriteLinesInAFile(filePath string, lines []string) error {
	f, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer f.Close()

	if len(lines) == 0 {
		return errors.New("there are no lines to write")
	}

	textToWrite := strings.Join(lines, "\n")
	_, err = f.Write([]byte(textToWrite))
	if err != nil {
		return err
	}
	return nil
}

func GetLinesFromFile(path string) ([]string, error) {
	var lines = []string(nil)

	fileStat, err := os.Stat(path)
	if err != nil {
		return nil, err
	}

	buf := make([]byte, fileStat.Size())
	file, err := os.OpenFile(path, os.O_RDONLY, os.FileMode(644))
	if err != nil {
		return nil, err
	}
	defer file.Close()

	_, err = file.Read(buf)
	if err != nil {
		return nil, err
	}

	lines = strings.Split(strings.Replace(string(buf), "\r\n", "\n", -1), "\n")
	return lines, nil
}

func CopyFile(basePath, srcName, dstName string) error {
	srcPath := path.Join(basePath, srcName)
	dstPath := path.Join(basePath, dstName)
	sourceFileStat, err := os.Stat(srcPath)
	if err != nil {
		return err
	}

	if !sourceFileStat.Mode().IsRegular() {
		return fmt.Errorf("%s is not a regular file", srcPath)
	}

	source, err := os.Open(srcPath)
	if err != nil {
		return err
	}
	defer source.Close()

	destination, err := os.Create(dstPath)
	if err != nil {
		return err
	}
	defer destination.Close()
	_, err = io.Copy(destination, source)
	return err
}

func ListFileNamesInDirectory(scanDir string) ([]string, error) {
	var fileNames []string
	files, err := ioutil.ReadDir(scanDir)
	if err != nil {
		return nil, err
	}

	for _, f := range files {
		if !f.IsDir() {
			fileNames = append(fileNames, f.Name())
		}
	}
	return fileNames, nil
}


func ListDirNamesInDirectory(scanDir string) ([]string, error) {
	var fileNames []string
	files, err := ioutil.ReadDir(scanDir)
	if err != nil {
		return nil, err
	}

	for _, f := range files {
		if f.IsDir() {
			fileNames = append(fileNames, f.Name())
		}
	}
	return fileNames, nil
}

func UploadFile(w http.ResponseWriter, r *http.Request, uploadPath string, fileKey string) error {
	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		return err
	}

	file, handler, err := r.FormFile(fileKey)
	if err != nil {
		return err
	}
	defer file.Close()
	f, err := os.OpenFile(filepath.Join(uploadPath, handler.Filename), os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		return err
	}
	defer f.Close()
	_, err = io.Copy(f, file)
	if err != nil {
		return err
	}

	return nil
}


func UploadFileWithNewName(w http.ResponseWriter, r *http.Request, uploadPath string, fileKey string, newName string) error {
	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		return err
	}

	file, _, err := r.FormFile(fileKey)
	if err != nil {
		return err
	}
	defer file.Close()
	f, err := os.OpenFile(filepath.Join(uploadPath, newName), os.O_WRONLY|os.O_CREATE, 0755)
	if err != nil {
		return err
	}
	defer f.Close()
	_, err = io.Copy(f, file)
	if err != nil {
		return err
	}

	return nil
}

func HandleDownloadFileReq(w http.ResponseWriter, r *http.Request, downloadPath string, fileName string) {
	http.ServeFile(w, r, filepath.Join(downloadPath, fileName))
}


func DeleteFile(w http.ResponseWriter, r *http.Request, deletePath string, fileName string) error {
	fPath := path.Join(deletePath, fileName)
	if err := os.Remove(fPath); err != nil {
		return err
	}

	return nil
}

func StringInSlice(a string, list []string) bool {
	for _, b := range list {
		if b == a {
			return true
		}
	}
	return false
}

// TODO(bradfitz): this was copied from x/build/cmd/buildlet/buildlet.go
// but there were some buildlet-specific bits in there, so the code is
// forked for now.  Unfork and add some opts arguments here, so the
// buildlet can use this code somehow.

// Untar reads the gzip-compressed tar file from r and writes it into dir.
func Untar(r io.Reader, dir string) error {
	return untar(r, dir)
}

func untar(r io.Reader, dir string) (err error) {
	t0 := time.Now()
	nFiles := 0
	madeDir := map[string]bool{}
	defer func() {
		td := time.Since(t0)
		if err == nil {
			log.Printf("extracted tarball into %s: %d files, %d dirs (%v)", dir, nFiles, len(madeDir), td)
		} else {
			log.Printf("error extracting tarball into %s after %d files, %d dirs, %v: %v", dir, nFiles, len(madeDir), td, err)
		}
	}()
	zr, err := gzip.NewReader(r)
	if err != nil {
		return fmt.Errorf("requires gzip-compressed body: %v", err)
	}
	tr := tar.NewReader(zr)
	loggedChtimesError := false
	for {
		f, err := tr.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Printf("tar reading error: %v", err)
			return fmt.Errorf("tar error: %v", err)
		}
		if !validRelPath(f.Name) {
			return fmt.Errorf("tar contained invalid name error %q", f.Name)
		}
		rel := filepath.FromSlash(f.Name)
		abs := filepath.Join(dir, rel)

		fi := f.FileInfo()
		mode := fi.Mode()
		switch {
		case mode.IsRegular():
			// Make the directory. This is redundant because it should
			// already be made by a directory entry in the tar
			// beforehand. Thus, don't check for errors; the next
			// write will fail with the same error.
			dir := filepath.Dir(abs)
			if !madeDir[dir] {
				if err := os.MkdirAll(filepath.Dir(abs), 0755); err != nil {
					return err
				}
				madeDir[dir] = true
			}
			wf, err := os.OpenFile(abs, os.O_RDWR|os.O_CREATE|os.O_TRUNC, mode.Perm())
			if err != nil {
				return err
			}
			n, err := io.Copy(wf, tr)
			if closeErr := wf.Close(); closeErr != nil && err == nil {
				err = closeErr
			}
			if err != nil {
				return fmt.Errorf("error writing to %s: %v", abs, err)
			}
			if n != f.Size {
				return fmt.Errorf("only wrote %d bytes to %s; expected %d", n, abs, f.Size)
			}
			modTime := f.ModTime
			if modTime.After(t0) {
				// Clamp modtimes at system time. See
				// golang.org/issue/19062 when clock on
				// buildlet was behind the gitmirror server
				// doing the git-archive.
				modTime = t0
			}
			if !modTime.IsZero() {
				if err := os.Chtimes(abs, modTime, modTime); err != nil && !loggedChtimesError {
					// benign error. Gerrit doesn't even set the
					// modtime in these, and we don't end up relying
					// on it anywhere (the gomote push command relies
					// on digests only), so this is a little pointless
					// for now.
					log.Printf("error changing modtime: %v (further Chtimes errors suppressed)", err)
					loggedChtimesError = true // once is enough
				}
			}
			nFiles++
		case mode.IsDir():
			if err := os.MkdirAll(abs, 0755); err != nil {
				return err
			}
			madeDir[abs] = true
		default:
			return fmt.Errorf("tar file entry %s contained unsupported file type %v", f.Name, mode)
		}
	}
	return nil
}

func validRelativeDir(dir string) bool {
	if strings.Contains(dir, `\`) || path.IsAbs(dir) {
		return false
	}
	dir = path.Clean(dir)
	if strings.HasPrefix(dir, "../") || strings.HasSuffix(dir, "/..") || dir == ".." {
		return false
	}
	return true
}

func validRelPath(p string) bool {
	if p == "" || strings.Contains(p, `\`) || strings.HasPrefix(p, "/") || strings.Contains(p, "../") {
		return false
	}
	return true
}

