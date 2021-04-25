// [ share page ]
// bundle entry

// import libs

// js scripts

// stylesheet
import './index.styl';
import html2canvas from 'html2canvas';
import './FileSaver';

// eslint-disable-next-line no-unused-vars
function Save ()
{
    html2canvas(document.body).then(canvas => {
        // 将canvas内容保存为文件并下载
        canvas.toBlob(function (blob) {
            // eslint-disable-next-line no-undef
            saveAs(blob, 'hangge.png');
        });
    });
}










