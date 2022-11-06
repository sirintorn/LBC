/**
 * version1: convert online image
 * @param  {String}   url
 * @param  {Function} callback
 * @param  {String}   [outputFormat='image/png']
 * @author HaNdTriX
 * @example
    convertImgToBase64('http://goo.gl/AOxHAL', function(base64Img){
        console.log('IMAGE:',base64Img);
    })
 */
function convertImgToBase64(url, callback, outputFormat){
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
       canvas.height = this.height;
       canvas.width = this.width;
        // canvas.height = 1200;
        // canvas.width = 1600;
        ctx.drawImage(this,0,0);
        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
        callback(dataURL);
        canvas = null;
    };
    img.src = url;
}

/*
** version2: convert local image
*/
function encodeImageFileAsURL(cb) {
            return function(){
                var file = this.files[0];
                var reader  = new FileReader();
                reader.onloadend = function () {
                    cb(reader.result);
                }
                reader.readAsDataURL(file);
            }
        }

/*
** version3: another local image convert
** add html:
** <input id="inputFileToLoad" type="file" onchange="encodeImageFileAsURL();" />
** <div id="imgTest"></div>
*/
function encodeImageFileAsURL(){

    var filesSelected = document.getElementById("inputFileToLoad").files;
    if (filesSelected.length > 0)
    {
        var fileToLoad = filesSelected[0];

        var fileReader = new FileReader();

        fileReader.onload = function(fileLoadedEvent) {
            var srcData = fileLoadedEvent.target.result; // <--- data: base64

            var newImage = document.createElement('img');
            newImage.src = srcData;

            document.getElementById("imgTest").innerHTML = newImage.outerHTML;
            alert("Converted Base64 version is "+document.getElementById("imgTest").innerHTML);
            console.log("Converted Base64 version is "+document.getElementById("imgTest").innerHTML);
        }
        fileReader.readAsDataURL(fileToLoad);
    }
}
