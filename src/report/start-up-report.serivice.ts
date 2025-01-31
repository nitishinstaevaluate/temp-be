import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { axiosInstance } from "src/middleware/axiosConfig";
import * as path from 'path';
const fs = require('fs');
import hbs = require('handlebars');
import * as puppeteer from 'puppeteer';

@Injectable()
export class StartUpReportService {

    async generatePDF(res) {
        try {
          let htmlContent = '';
          const pdfFilePath = path.join(process.cwd(), 'pdf', `start-up-report.pdf`);
          // const htmlFileStack = ['./1.html', './2.html', './3.html']
          for (let i = 1; i<= 48; i++){
            if(i === 16) {
            //   // const htmlFilePath = path.join(process.cwd(), 'html-template', 'start-up-report', `${i}.html`);
              htmlContent += await this.loadGraph()
            }else{
              const htmlFilePath = path.join(process.cwd(), 'html-template', 'start-up-report', `${i}.html`);
              htmlContent += fs.readFileSync(htmlFilePath, 'utf8');
            }
          }
          const pdf = await this.generatePdf(htmlContent, pdfFilePath);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="='start-up-report'.pdf"`);
          res.send(pdf); 
          return {
            msg: `download Success`,
            status: true,
          };
          // const template = hbs.compile(htmlContent);
          // const html = template(valuationResult);
            // const pptPath = 'samples/adrTwo.docx';
            // const accessKey = "NDYzMTdhOWYtZTIyMi00N2MyLWI4MzMtNjFjNjgxYzBmMDFhOjQ5MDk3NjkzMTY";
            // const outputName = "generated-start-up-valuation-3.docx";
            // // const response:any = await axiosInstance.post(
            // //     'https://us1.dws4.docmosis.com/api/render',
            // //     {
            // //     headers: {
            // //         "Content-Type": "application/x-www-form-urlencoded",
            // //         "Content-Length": Buffer.byteLength(new URLSearchParams({
            // //             "accessKey":accessKey,
            // //             "templateName":pptPath,
            // //             "outputName":"generated-start-up-valuation-report.pdf",
            // //             "data":JSON.stringify({ "email":"sanket@gmail.com"})
            // //         }).toString())
            // //     },
            // //     }
            // // );
            // // switch (response?.statusCode) {
            // //     case 200:
            // //         var file = fs.createWriteStream("generated-start-up-valuation-report.pdf");
            
            // //         // feed response into file
            // //         response.pipe(file);
            // //         file.on("finish", () => {
            // //             file.close();
            // //             console.log("generated-start-up-valuation-report.pdf", "created");
            // //         });
            // //         break;
            // //     default:
            // //         console.log("Error response:", response?.statusCode, response?.statusMessage);
            // //         var res = "";
            // //         response?.on("data", (data) => {
            // //             res += data;
            // //         });
            // //         response?.on("end", () => {
            // //             console.log(res);
            // //         });
            // //         return res;
            // //     }

            // console.log(pptPath,"ppt path")
            // const response = await axiosInstance.post(
            //     'https://us1.dws4.docmosis.com/api/render',
            //     new URLSearchParams({
            //       accessKey: accessKey,
            //       templateName: pptPath,
            //       outputName: 'generated-start-up-valuation-3.docx',
            //       data: JSON.stringify({ email: 'sanket@gmail.com' })
            //     }).toString(),
            //     {
            //       headers: {
            //         'Content-Type': 'application/x-www-form-urlencoded'
            //       },
            //       responseType: "stream",
            //     }
            //   );
              
            // //   if (response.status === 200) {
            // //     const file = fs.createWriteStream('generated-start-up-valuation-report.pdf');
            // //     file.write(response.data);
            // //     file.end(() => console.log('File created: generated-start-up-valuation-report.pdf'));
            // //   } else {
            // //     console.log('Error response:', response.status, response.statusText);
            // //   }
            // const writer = fs.createWriteStream(outputName);
            // response.data.pipe(writer);
    
            // writer.on("finish", () => {
            //     console.log(`${outputName} has been created successfully!`);
            //     return true;
            // });
    
            // writer.on("error", (err) => {
            //     console.error("Error writing file:", err);
            //      return false
            // });
        } catch (error) {
        //   console.error('Error generating PDF:', error);
        throw error;
        }
      };

      async generatePdf(htmlContent, pdfFilePath){
        const browser = await puppeteer.launch({
          headless:"new",
          executablePath: process.env.PUPPETEERPATH,
          args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-software-rasterizer']
        });
        const page = await browser.newPage();

        try {
          const contenread = await page.setContent(htmlContent);
          const pdf = await page.pdf({
            path: pdfFilePath,
            format: 'A4' as puppeteer.PaperFormat,
            displayHeaderFooter: true,
            printBackground: true,
            // footerTemplate:`<div style="width:100%;padding-top:5%">
            // <hr style="border:1px solid #bbccbb">
            // <h1 style="padding-left: 5%;text-indent: 0pt;text-align: center;font-size:11px;color:#5F978E;"><span style="font-weight:400 !important;">Page <span class="pageNumber"></span></span></span> <span style="float: right;padding-right: 3%;font-size:12px"> Private &amp; confidential </span></h1>
            // </div>` ,
          //   margin: {
          //     right: "",
          // },          
          });
          return pdf;
        } catch (error) {
          console.error('Error generating PDF:', error);
        } finally {
          await browser.close();
        }
      }


      async loadGraph(){
        try{
          const chartConfigOne = {
            type: 'bar',
            data: {
            labels: ['January', 'February', 'March', 'April', 'May'],
            datasets: [
              {
              label: 'Sales (Column)',
              data: [12, 19, 3, 5, 2],
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
              },
              {
              label: 'Revenue (Line)',
              data: [8, 14, 5, 8, 10],
              type: 'line',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
              fill: false
              }
            ]
            },
            options: {
            responsive: true,
            scales: {
              y: {
              beginAtZero: true
              }
            }
            }
          };
          const chartConfigTwo = {
            type: 'line',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr'],
              datasets: [{
              label: 'Revenue',
              data: [15, 25, 35, 45],
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
              fill: false
              }, {
              label: 'Profit',
              data: [10, 20, 30, 40],
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2,
              fill: false
              }]
            },
            options: {
              responsive: true
            }
          }
          const templateString = `<!DOCTYPE html>
          <html lang="en">
          <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>4 Quadrant Layout</title>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            body {
            font-family:'Lora', serif;
            margin: 0;
            padding: 0;
            }

            .box-16 {
              display: flex;
              justify-content: space-between;
            }

            .left-16, .right-16 {
            width: 48%;
            }

            .valuer {
            font-size: 18px;
            margin: 5px 0;
            }

            .draft {
              font-size: 16px;
              font-weight: bold;
              color: #da6d24;
              margin-top: 6px;
              padding-top: 0px;
            }

            .footer-16 {
              padding-top: 50%;
              text-align: center;
            }

            .footer-line-16 {
              border-top: 2px solid #000;
              padding: 6px 0;
            }

            .footer-text-16 {
              display: flex;
              justify-content: space-between;
              padding: 0 20px;
            }

            .confidential-16 {
              font-size:14px;
              font-weight: bold;
              color: #3f8771;
            }

            .page-number-16 {
              font-size: 14px;
              font-weight: bold;
              color: #3f8771;
            }

            .sub-header-16 {
              text-align: left;
              margin-top: 0px;
              margin-bottom: 0px;
              color: #da6d24;
            }

            .sub-header-16 h2 {
              font-size: 13px;
              text-align: justify;
              width: 90%;
            }

            .quadrant {
              padding: 10px;
              overflow: hidden;
            }

            .table-container-16 {
            grid-column: 1 / 2;
            grid-row: 1 / 2;
            border: none;
            padding: 10px;
            padding-bottom: 10%;
            }

            .text-container-16 {
            grid-column: 2 / 3;
            grid-row: 1 / 2;
            border-left: 1px solid rgba(199, 198, 198, 0.753);
            /* border-bottom: 1px solid rgba(199, 198, 198, 0.753); */
            padding-left: 20px;
            padding-bottom: 10%;
            }

            .graph-container-16 {
            grid-column: 1 / 2;
            grid-row: 2 / 3;
            padding-top: 20px;
            padding-left: 20px;
            border-top: 1px solid rgba(199, 198, 198, 0.753);
            padding-top: 10%;
            /* border-right: 1px solid rgba(199, 198, 198, 0.753); */
            }

            .graph-container-second {
            grid-column: 2 / 3;
            grid-row: 2 / 3;
            padding-top: 20px;
            padding-left: 20px;
            border-left: 1px solid rgba(199, 198, 198, 0.753);
            border-top: 1px solid rgba(199, 198, 198, 0.753);
            padding-top: 10%;
            }

            .table-16 {
                width: 100%;
                border-collapse: collapse;
              margin: auto;
              padding-top: 1%;
              }
              .table-16 th, .table-16 td {
                padding: 0px;
                border: 1px solid #ddd;
                text-align: center;
              font-size: 7px;
              padding: 1px;
              }
              .table-16 th {
              background-color: #4eb693;
              color: white;
              }

            .table-16 tr:nth-child(even) {
              background-color: #d1f0e5;
            }

            .table-16 tr:nth-child(odd) {
              background-color: #ffffff;
            }

            .page-16-main-content{
              /* padding: 3%; */
              padding-top: 0px;
            }
            .page-16-main-content p {
              font-size: 10px;
              padding-top:4px ;
              padding-bottom:4px ;
              margin-bottom:0px ;
              margin-top:0px ;
              text-align: justify;
              text-indent: -10px;
              padding-left: 1%;
            }
          </style>
          </head>
          <body >
              <div style="page-break-before: always;"></div>
              <div style="padding: 2%;">
                <div style="border: 2px solid #3f8771;padding: 15px;padding-top: 4%; padding-bottom: 4%;">
                  <div class="box-16">
                    <div class="left-16">
                    <p class="valuer" style="font-weight: bold;color: #3f8771;font-family: 'Arial', serif;">Management Business Plan</p>
                    </div>
                    <div class="right-16">
                    <p class="draft">Draft for discussion purpose only</p>
                    </div>
                  </div>
                  <h2 style="color: #3f8771;margin-top: 0px;font-family: 'Arial', serif;margin-bottom: 0px;">Revenue Analysis</h2>
                </div>
            
                <div style="margin: 0;padding: 0;display: grid;grid-template-columns: 50% 50%;grid-template-rows: 50% 50%;width: 100%;padding-top: 6%;">
                    <div class="quadrant table-container-16">
                      <!-- <h2>Table Example</h2> -->
                      <table class="table-16">
                      <thead>
                        <tr>
                        <th>Description</th>
                        <th>2023-24</th>
                        <th>2023-24</th>
                        <th>2023-24</th>
                        <th>2023-24</th>
                        <th>2023-24</th>
                        <th>2023-24</th>
                        <th>2023-24</th>
                        <th>2023-24</th>
                        <th>2023-24</th>
                        <th>2023-24</th>
                        <th>2023-24</th>
                        </tr>
                      </thead>
                      <tr>
                        <td>Row 1 Description</td>
                        <td>1</td>
                        <td>2</td>
                        <td>3</td>
                        <td>4</td>
                        <td>5</td>
                        <td>6</td>
                        <td>7</td>
                        <td>8</td>
                        <td>9</td>
                        <td>10</td>
                        <td>11</td>
                        </tr>
                        <tr>
                        <td>Row 2 Description</td>
                        <td>2</td>
                        <td>3</td>
                        <td>4</td>
                        <td>5</td>
                        <td>6</td>
                        <td>7</td>
                        <td>8</td>
                        <td>9</td>
                        <td>10</td>
                        <td>11</td>
                        <td>12</td>
                        </tr>
                        <tr>
                        <td>Row 2 Description</td>
                        <td>2</td>
                        <td>3</td>
                        <td>4</td>
                        <td>5</td>
                        <td>6</td>
                        <td>7</td>
                        <td>8</td>
                        <td>9</td>
                        <td>10</td>
                        <td>11</td>
                        <td>12</td>
                        </tr>
                        <tr>
                        <td>Row 2 Description</td>
                        <td>2</td>
                        <td>3</td>
                        <td>4</td>
                        <td>5</td>
                        <td>6</td>
                        <td>7</td>
                        <td>8</td>
                        <td>9</td>
                        <td>10</td>
                        <td>11</td>
                        <td>12</td>
                        </tr>
                        <tr>
                        <td>Row 2 Description</td>
                        <td>2</td>
                        <td>3</td>
                        <td>4</td>
                        <td>5</td>
                        <td>6</td>
                        <td>7</td>
                        <td>8</td>
                        <td>9</td>
                        <td>10</td>
                        <td>11</td>
                        <td>12</td>
                        </tr>
                        <tr>
                        <td>Row 2 Description</td>
                        <td>2</td>
                        <td>3</td>
                        <td>4</td>
                        <td>5</td>
                        <td>6</td>
                        <td>7</td>
                        <td>8</td>
                        <td>9</td>
                        <td>10</td>
                        <td>11</td>
                        <td>12</td>
                        </tr>
                        <tr>
                        <td>Row 2 Description</td>
                        <td>2</td>
                        <td>3</td>
                        <td>4</td>
                        <td>5</td>
                        <td>6</td>
                        <td>7</td>
                        <td>8</td>
                        <td>9</td>
                        <td>10</td>
                        <td>11</td>
                        <td>12</td>
                        </tr>
                        <tr>
                        <td>Row 2 Description</td>
                        <td>2</td>
                        <td>3</td>
                        <td>4</td>
                        <td>5</td>
                        <td>6</td>
                        <td>7</td>
                        <td>8</td>
                        <td>9</td>
                        <td>10</td>
                        <td>11</td>
                        <td>12</td>
                        </tr>
                      </table>
                    </div>
            
                    <div class="quadrant text-container-16">
                      <div class="sub-header-16" style="padding-top: 1%;">
                        <h2 style="padding-left: 0%;font-size: 15px;">Key Points
                        </h2>
                      </div>
                      <div class="page-16-main-content">
                        <p><span style="color: #da6d24;padding-right: 1%;font-size: 10px;">&#8226;</span>Management has projected revenue to grow from INR XX crore in FYXX to INR XX crore by FYXXXX This is mainly on account of having a unique soya based ink facility available with the company.</p>
                        <p><span style="color: #da6d24;padding-right: 1%;font-size: 10px;">&#8226;</span>The Gross Profit of the company increases/ decreased from INR XX Crore in FYXXX to INR XX crore in FYXXX. The margins also tend to improve on account of efficiency in the production process.</p>
                        <p><span style="color: #da6d24;padding-right: 1%;font-size: 10px;">&#8226;</span>The employee benefit expense and the other expenses are projected to increases/ decreased in line with inflation.</p>
                      </div>
                    </div>
            
                    <div class="quadrant graph-container-16">
                      <!-- <h2>Graph 1</h2> -->
                      <canvas id="graph1"></canvas>
                      <script>
                      const ctx1 = document.getElementById('graph1').getContext('2d');
                      new Chart(ctx1, ${JSON.stringify(chartConfigOne)} );
                      </script>
                    </div>
            
                    <div class="quadrant graph-container-second">
                      <!-- <h2>Graph 2</h2> -->
                      <canvas id="graph2"></canvas>
                      <script>
                      const ctx2 = document.getElementById('graph2').getContext('2d');
                      new Chart(ctx2, ${JSON.stringify(chartConfigTwo)});
                      </script>
                    </div>
                </div>
                <div class="footer-16">
                  <div class="footer-line-16"></div>
                  <div class="footer-text-16">
                    <span class="confidential-16">Strictly private and confidential</span>
                    <span class="page-number-16">Page 15</span>
                  </div>
                </div>
              </div>

          </body>
          </html>`
          return templateString;
        }
        catch(error){
          throw error;
        }
      }
}