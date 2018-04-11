String.prototype.endWith=function(endStr){
  var d=this.length-endStr.length;
  return (d>=0&&this.lastIndexOf(endStr)==d)
}
window.onload = function() {
    new Visualizer().ini();
};
var Visualizer = function() {
    this.file = null; //the current file
    this.fileName = null; //the current file name
    this.audioContext = null;
    this.source = null; //the audio source'http://www.kxquick.com/assets/images/text.pcm'
//  this.info = document.getElementById('info').innerHTML; //this used to upgrade the UI information
    this.infoUpdateId = null; //to sotore the setTimeout ID and clear the interval
    this.animationId = null;
    this.status = 0; //flag for sound is playing 1 or stopped 0
    this.forceStop = false;
    this.allCapsReachBottom = false;
};
Visualizer.prototype = {
    ini: function() {
        this._prepareAPI();
        this._addEventListner();
    },
    _prepareAPI: function() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;
        try {
            this.audioContext = new AudioContext();
        } catch (e) {
            console.log(e);
        }
    },
    _addEventListner: function() {
    	var d=0;
        var that = this;
       	
//          audioInput = document.getElementsByName('1'),
						
            yt = document.getElementsByClassName('yt')
//          ytyt = document.getElementById('ytyt'),
//          dropContainer = document.getElementsByTagName("canvas")[0];
        //listen the file upload
       for(var i=0;i<yt.length;i++){
       	 yt[i].onclick = function() {
						var name= this.getAttribute('name')
            if (that.audioContext===null) {return;};
	            var inputList = document.getElementsByTagName("input");
	            for(var i=0;i<inputList.length;i++){
	            	if(inputList[i].name==name){
	            		d=i;
//	            		alert(d);
	            	}
	            }
	            //the if statement fixes the file selction cancle, because the onchange will trigger even the file selection been canceled
	            if (inputList[d].files.length !== 0) {
	            	console.log(1111111);
	                //only process the first file
	                that.file = inputList[d].files[0];
	                console.log(that.file);
	                that.fileName = that.file.name;
	                if (that.status === 1) {
	                    //the sound is still playing but we upload another file, so set the forceStop flag to true
	                    that.forceStop = true;
	                };
	                //once the file is ready,start the visualizer
	                that._start();
	            };
	        };
       }
//      ytyt.onclick = function(){
////      	that._updateInfo('Uploading', false);
//      }
    },
    _start: function() {
        //read and decode the file into audio array buffer 
        var that = this,
            file = this.file,
            fr = new FileReader();
            console.log('yytytytytytytytt');
            console.log(fr)
        fr.onload = function(e) {
        	console.log(17)
        	console.log(e);
            var fileResult = e.target.result;
            var audioContext = that.audioContext;
            if (audioContext === null) {
                return;
            };
//          that._updateInfo('Decoding the audio', true);          
            var addWavHeader = function(samples,sampleRateTmp,sampleBits,channelCount){
                var dataLength = samples.byteLength;
                var buffer = new ArrayBuffer(44 + dataLength);
                var view = new DataView(buffer);
                function writeString(view, offset, string){
                    for (var i = 0; i < string.length; i++){
                        view.setUint8(offset + i, string.charCodeAt(i));
                    }
                }
                
                var offset = 0;
                /* 资源交换文件标识符 */
                writeString(view, offset, 'RIFF'); offset += 4;
                /* 下个地址开始到文件尾总字节数,即文件大小-8 */
                view.setUint32(offset, /*32*/ 36 + dataLength, true); offset += 4;
                /* WAV文件标志 */
                writeString(view, offset, 'WAVE'); offset += 4;
                /* 波形格式标志 */
                writeString(view, offset, 'fmt '); offset += 4;
                /* 过滤字节,一般为 0x10 = 16 */
                view.setUint32(offset, 16, true); offset += 4;
                /* 格式类别 (PCM形式采样数据) */
                view.setUint16(offset, 1, true); offset += 2;
                /* 通道数 */
                view.setUint16(offset, channelCount, true); offset += 2;
                /* 采样率,每秒样本数,表示每个通道的播放速度 */
                view.setUint32(offset, sampleRateTmp, true); offset += 4;
                /* 波形数据传输率 (每秒平均字节数) 通道数×每秒数据位数×每样本数据位/8 */
                view.setUint32(offset, sampleRateTmp * channelCount * (sampleBits / 8), true); offset +=4;
                /* 快数据调整数 采样一次占用字节数 通道数×每样本的数据位数/8 */
                view.setUint16(offset, channelCount * (sampleBits / 8), true); offset += 2;
                /* 每样本数据位数 */
                view.setUint16(offset, sampleBits, true); offset += 2;
                /* 数据标识符 */
                writeString(view, offset, 'data'); offset += 4;
                /* 采样数据总数,即数据总大小-44 */
                view.setUint32(offset, dataLength, true); offset += 4;
                function floatTo32BitPCM(output, offset, input){
                    input = new Int32Array(input);
                    for (var i = 0; i < input.length; i++, offset+=4){
                        output.setInt32(offset,input[i],true);
                    }
                }
                function floatTo16BitPCM(output, offset, input){
                    input = new Int16Array(input);
                    for (var i = 0; i < input.length; i++, offset+=2){
                        output.setInt16(offset,input[i],true);
                    }
                }
                function floatTo8BitPCM(output, offset, input){
                    input = new Int8Array(input);
                    for (var i = 0; i < input.length; i++, offset++){
                        output.setInt8(offset,input[i],true);
                    }
                }
                if(sampleBits == 16){
                    floatTo16BitPCM(view, 44, samples);
                }else if(sampleBits == 8){
                    floatTo8BitPCM(view, 44, samples);
                }else{
                    floatTo32BitPCM(view, 44, samples);
                }
                return view.buffer;
            }
            if(that.fileName.endWith(".pcm")){
                var sampleRateTmp = 16000;
                var sampleBits = 16;
                var channelCount = 1;
                fileResult = addWavHeader(fileResult,sampleRateTmp,sampleBits,channelCount);
            }

            audioContext.decodeAudioData(fileResult, function(buffer) {
                that._visualize(audioContext, buffer);
            }, function(e) {
                console.log(e);
            });
        };
        fr.onerror = function(e) {
            console.log(e);
        };
        //assign the file to the reader
        fr.readAsArrayBuffer(file);
    },
    _visualize: function(audioContext, buffer) {
        var audioBufferSouceNode = audioContext.createBufferSource(),
            analyser = audioContext.createAnalyser(),
            that = this;
        //connect the source to the analyser
        audioBufferSouceNode.connect(analyser);
        //connect the analyser to the destination(the speaker), or we won't hear the sound
        analyser.connect(audioContext.destination);
        //then assign the buffer to the buffer source node
        audioBufferSouceNode.buffer = buffer;
        //play the source
        if (!audioBufferSouceNode.start) {
            audioBufferSouceNode.start = audioBufferSouceNode.noteOn //in old browsers use noteOn method
            audioBufferSouceNode.stop = audioBufferSouceNode.noteOff //in old browsers use noteOff method
        };
        //stop the previous sound if any
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.source !== null) {
            this.source.stop(0);
        }
        audioBufferSouceNode.start(0);
        this.status = 1;
        this.source = audioBufferSouceNode;
        audioBufferSouceNode.onended = function() {
            that._audioEnd(that);
        };
    },
    _audioEnd: function(instance) {
    	alert(1)
        if (this.forceStop) {
            this.forceStop = false;
            this.status = 1;
            return;
        };
        this.status = 0;
    }
}
