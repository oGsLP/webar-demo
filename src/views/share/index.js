// [ share page ]
// bundle entry

// import libs

// js scripts

// stylesheet
import './index.less';
import html2canvas from 'html2canvas';
import saveAs from './FileSaver';

let button = document.getElementsByClassName('div9');
alert(button.length);

button.addEventListener('click', function ()
{

    console.log('hello');
    // html2canvas(document.body).then(canvas => {
    //     // 将canvas内容保存为文件并下载
    //     console.log('save');
    //     canvas.toBlob(function (blob) {
    //         // eslint-disable-next-line no-undef
    //         saveAs(blob, 'hangge.png');
    //     });
    // });
});












