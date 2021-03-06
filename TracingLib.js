// -------------------------------------------------------------------------------------------------------
// -----------------=============######## Real Time Tracing Library ########=============-----------------
// -------------------------------------------------------------------------------------------------------
//  Copyright / HGustavs / a97marbr / Influenced by some ideas from PoTrace
//
//        (\ /)
//        (. .)           
//       c(")(")  ∴ 
//--------------------------------------------------------------------------------------------------------

//------------==========########### GLOBALS ###########==========------------

// Benchmark Globals

var host="parsedata.php";
var measurementSeries="Infographics_OSX_FF";
var initRepCnt=1; // Default # repetitions
var imgsource="";
var repcnt=0, rescnt=0;

// Measurement Array

var resarr=[15,20,23,30,30,40,38,50,45,60,53,70,60,80,68,90,75,100,83,110,90,120,98,130,105,140,113,150,120,160,128,170,135,180,143,190,150,200,158,210,165,220,173,230,180,240,188,250,195,260,203,270,210,280,218,290,225,300,233,310,240,320,248,330,255,340,263,350,270,360,278,370,293,390,300,400,308,410,315,420,323,430,330,440,338,450,345,460,353,470,360,480,368,490,375,500,383,510,390,520,398,530,405,540,413,550,420,560,428,570,435,580,443,590,450,600,458,610,465,620,473,630,480,640,488,650,495,660,503,670,510,680,518,690,525,700,533,710,540,720,548,730,555,740,563,750,570,760,578,770,585,780,593,790,600,800,615,820,630,840,645,860,660,880,668,890,675,900,690,920,705,940,720,960,735,980,750,1000];

// Tracing Library Globals

var ctx;
var data;
var bits=3;
var bitsplit=256/bits;
           
var maxw=600;
var maxh=800;    
var rw=maxw+maxw;
        
var buffer = new ArrayBuffer(1024);
var cache = new Int16Array(buffer);

var histogram=[];
var objs = [];
var consloe={};

//------------==========########### Benchmark Functions ###########==========------------

//--------------------------------------------------------------------------
// Initialize the TracingLib
// ---------------
// _reps, the number of repetitions to run at a given resolution
// _tag, store all benchmark data with this tag
// _ imgsource, the prefix for all imgs 
//--------------------------------------------------------------------------

function initTracingLib(_reps, _tag, _imgsource){
    measurementSeries=_tag;
    initRepCnt=_reps;
    imgsource=_imgsource;
    initcanvas();
}

function resetBenchmark(){
    localStorage.setItem('repcnt','0');
    localStorage.setItem('rescnt','0');
    localStorage.setItem('benchmark','');
    repcnt=parseInt(localStorage.getItem('repcnt'));
    rescnt=parseInt(localStorage.getItem('rescnt'));  
    document.getElementById("res").innerHTML=(rescnt+1)+"/"+((resarr.length/2)+1);
    document.getElementById("reps").innerHTML=(repcnt)+"/"+initRepCnt;
}

//--------------------------------------------------------------------------
// Transmit benchmark
// ---------------
// Used to trans the collected measurements to an SQLite DB
// measurementSeries is used to tag the particular batch of measurements
//--------------------------------------------------------------------------

function transmitBenchmark(){
    var xhttp = new XMLHttpRequest();
    var params = "benchmark="+localStorage.getItem('benchmark')+"&m="+measurementSeries;

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          document.getElementById("consloe").innerHTML = this.responseText;
        }
    };
    xhttp.open("POST", host, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(params);
}
      
consloe.log=function(gobBluth)
{
		document.getElementById("consloe").innerHTML=((JSON.stringify(gobBluth)+"<br>")+document.getElementById("consloe").innerHTML);
} 
        
function imageloaded()
{
    var img=document.getElementById("imgy");

    // Clear to allow us to read/write pixels properly
    ctx.fillStyle="#000";
    ctx.fillRect(0,0,rw,maxh); 

    // Source image
    ctx.drawImage(img,0,0);
    data=ctx.getImageData(0, 0, rw, maxh);

    updateview();
}        

function initcanvas()
{
    var canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    repcnt=parseInt(localStorage.getItem('repcnt'));
    rescnt=parseInt(localStorage.getItem('rescnt'));  
    document.getElementById("res").innerHTML=(rescnt+1)+"/"+((resarr.length/2)+1)+"/("+resarr[(rescnt*2)+1]+"x"+resarr[(rescnt*2)]+")";
    document.getElementById("reps").innerHTML=(repcnt)+"/"+initRepCnt;
  
    var res=resarr[(rescnt*2)+1];
    maxw=resarr[rescnt*2];
    maxh=resarr[(rescnt*2)+1];
    rw=maxw+maxw;
  
    if(res<100){
        res="0"+res;
    }

    // Debugging aid!
//    res=800;
  
    var str='<img id="imgy" src="DemoImages/'+imgsource+res+'.png" onload="imageloaded();" style="display:none;" />';
    document.getElementById("dave").innerHTML=str;

} 

var medw=5;
var medc=Math.floor(medw/2.0);

function median(depth)
{
    for(var yy=medc;yy<maxh-medw;yy++){
        for(var xx=medc;xx<maxw-medw;xx++){
            
            var valg=0;

            // Copy previous step except for last vertical line e.g. last cache
            for(var cacheno=0;cacheno<medw-1;cacheno++){
                // For each position in each cache copy the value
                for(var pos=0;pos<medw;pos++){
                    cache[(pos*medw)+cacheno]=cache[(pos*medw)+cacheno+1];
                }
            }
            
            // Read one pixel before
            var cacheno=(medw-1);

            for(var cnt=0;cnt<medw;cnt++){
                // Position 
                var yk=rw*(cnt+yy-medc);
                cache[(medw*cnt)+(cacheno)]=data.data[((yk+(xx+medc))*4)+depth];
            }
            
            // Sort Newly added line using bubble sort
            var vala;
            var valb
            for(var cnt=medw-1;cnt>0;cnt--){
                for(var cnti=0;cnti<cnt;cnti++){                
                    vala=cache[(medw*cnti)+(cacheno)];
                    valb=cache[(medw*cnti)+(cacheno)+medw];
                    if(vala>valb){
                        cache[(medw*cnti)+(cacheno)]=valb;
                        cache[(medw*cnti)+(cacheno)+medw]=vala;
                    }                
                }
            }
            
            // Copy median data to last position in array
            for(var cnt=0;cnt<medw;cnt++){                
                cache[(medw*medw)+cnt]=cache[(medw*medc)+cnt];
            }
            
            // Bubble sort the last row
            for(var cnt=medw-1;cnt>0;cnt--){
                for(var cnti=0;cnti<cnt;cnti++){                
                    vala=cache[(medw*medw)+(cnti)];
                    valb=cache[(medw*medw)+(cnti)+1];
                    if(vala>valb){
                        cache[(medw*medw)+(cnti)]=valb;
                        cache[(medw*medw)+(cnti)+1]=vala;
                    }                
                }
            }
            
            valg=cache[(medw*medw)+medc];        

            /*
            if(xx>300&&yy==300){
                var str="";
                for(var cnty=0;cnty<(medw+1);cnty++){
                    for(var cntx=0;cntx<medw;cntx++){
                            str+=cache[(cnty*medw)+cntx]+" ";  
                    }
                    str+="\n";
                }
                alert(str);
            }
            */
            
             data.data[(((rw*yy)+(xx+maxw))*4)+depth]=valg;
        }
    }

}
        
function rgbmedian()
{
    median(0);
    median(1);
    median(2);
    
    // ctx.putImageData(data2,0,0);
    ctx.putImageData(data,0-maxw,0);
    data=ctx.getImageData(0, 0, rw, maxh);
}

function partialupdate()
{
    ctx.putImageData(data,0+maxw,0);
    setTimeout(function(){ partialupdate(); }, 1000);

}
        
function processHistogram()
{
    var antal=(bits*bits*bits);
    for(i=0;i<antal;i++){
        histogram[i]={col:{r:0,g:0,b:0},pos:i,cnt:0,used:false};
    }
        
    // Histogram
    for(var yy=0;yy<maxh;yy++){
        for(var xx=0;xx<maxw;xx++){            
            pixoa=getpix(xx-1,yy);
            
            var r=Math.floor(pixoa.r/bitsplit);
            var g=Math.floor(pixoa.g/bitsplit);
            var b=Math.floor(pixoa.b/bitsplit);
            
            var ind=r+(g*bits)+(b*bits*bits);
            
            histogram[ind].cnt++;
            histogram[ind].col.r=r;
            histogram[ind].col.g=g;
            histogram[ind].col.b=b;
            
        }
    }
        
    // Sort histogram
    histogram.sort(function(a, b){return b.cnt-a.cnt});
       
}

//--------------------------------------------------------------------------
// Flood fill
// ---------------
// start coordinate and trigger direction and color adder
//--------------------------------------------------------------------------

function floodfill(floodx,floody,trigger)
{

    // Flood fill shapev
    var flood=[];
    flood.push({xk:floodx,yk:floody});
    var iii=0;
    while(flood.length>0 /* &&iii<150000 */ ){
        pnt=flood.pop();
        var ind=((rw*pnt.yk)+pnt.xk)*4;
        if(pnt.xk>=0&pnt.yk>=0&&pnt.xk<maxw&&pnt.yk<maxh){
            var col=data.data[ind];
            var visited=data.data[ind+2];
          
            if(col==trigger&&visited==0){
                flood.push({xk:pnt.xk,yk:pnt.yk+1});
                flood.push({xk:pnt.xk,yk:pnt.yk-1});
                flood.push({xk:pnt.xk+1,yk:pnt.yk});
                flood.push({xk:pnt.xk-1,yk:pnt.yk});

                // set data to white
                data.data[ind]=255;

                // set visited (eg blue channel to visited)
                data.data[ind+2]=255;

                // set secondary display
                data.data[ind+(maxw*4)+2]=128;            
            }
        }
        iii++;
    }
    
//    ctx.putImageData(data,0-maxw,0);
//    alert(trigger+" "+iii+" "+floodx+" "+floody);
  
    // consloe.log("ff: "+iii+" "+trigger);
    
    // Return count of filled pixels
    return iii;
}
                
function updateview()
{

    // Image contains a pre-reduced red color palette.
    // Make all data either pure white or pure black!
    jj=0;
    for(var yy=0;yy<maxh;yy++){
        for(var xx=0;xx<maxw;xx++){
            var ind=((rw*yy)+xx)*4;
            data.data[ind+2]=0;
        }
    }
    
    var starttime=performance.now();
    var floodtime=0;

    // Flood fill green channel based on red channel contour.
    // cnt=floodfill(0,0,255);
        
    var gpp=0;
    var sx=1;
    var sy=1;
    var endpoint=false;
    var prn=0;
    var points=[];
        
    while(!endpoint){

        // Find first un-traced point
        var found=false;
        var r=0,g=0,b=0;
        xx=sx;
        yy=sy;
        while(!found){
            xx++;
            if(xx>maxw-1){
                xx=1;
                yy+=1;
            }

            var ind=((rw*yy)+xx)*4;
            r=data.data[ind];

            // If we find another un-traced point - we assume any color brigher than 250 to be part of the background
            if(found==false&&r<250){
                found=true;
                break;
            }
            
            // If we reach end of draw area
            if(yy>maxh-1){
                endpoint=true;
                break;
            } 
        }
        
        // alert("GPP "+gpp+" "+endpoint+" "+xx+" "+yy);
        
        // Keep track of last found un-filled black area
        sx=xx;
        sy=yy;

        if(!endpoint){
            var r1,r2,r3,r4;
            var ig=0;

            var xa=0;
            var ya=0;

            var show=0;

            // Trace path using marching square-like algorithm  
            // Automatically exits function if it has not found the end of the curve after 9000 pixels
            while(ig<29000){
                    var ind=((rw*yy)+xx)*4;

                    if(sx==xx&&sy==yy&&ig!=0){
                        break;
                    }
                
                    prn++;

                    // Read four points surrounding current point - compare to current point color
                    r1=(data.data[ind-(rw*4)-4]==r);
                    r2=(data.data[ind-(rw*4)]==r);
                    r3=(data.data[ind-4]==r);
                    r4=(data.data[ind]==r);
                
                    // if(prn<10) consloe.log(r+" "+r1+" "+r2+" "+r3+" "+r4+" "+xx+" "+yy);

                    // Mark current point as visited and prepared.
                    data.data[ind+(maxw*4)]=255;
                    data.data[ind+1+(maxw*4)]=255;
                    data.data[ind+2+(maxw*4)]=255;
                
                    // Add point to index list
                    // if(gpp==0) points.push({x:xx,y:yy});
                    points.push({x:xx,y:yy,corner:0});
                
                    // Compute Marching Square Index Value
                    ghindustry=(r1+(r2*2)+(r3*4)+(r4*8));

                    if((ghindustry==1)||(ghindustry==5)||(ghindustry==13)){
                        //  UP:		+---+---+   +---+---+   +---+---+
                        //				| 1 |   |   | 1 |   |   | 1 |   |
                        //				+---+---+   +---+---+   +---+---+
                        //				|   |   |   | 4 |   |   | 4 | 8 | <- current pixel (pX,pY)
                        //				+---+---+  	+---+---+  	+---+---+
                        xa=0;
                        ya=-1;
            //            consloe.log("UP "+r1+" "+r2+" "+r3+" "+r4+" "+xx+" "+yy+" "+ghindustry);
                    }else if((ghindustry==8)||(ghindustry==10)||(ghindustry==11)){
                        // DOWN:  +---+---+   +---+---+   +---+---+
                        //        |   |   |   |   | 2 |   | 1 | 2 |
                        //        +---+---+   +---+---+   +---+---+
                        //        |   | 8 |   |   | 8 |   |   | 8 | <- current pixel (pX,pY)
                        //        +---+---+  	+---+---+  	+---+---+
                        xa=0;
                        ya=1;
            //            consloe.log("DOWN "+r1+" "+r2+" "+r3+" "+r4+" "+xx+" "+yy+" "+ghindustry);
                    }else if((ghindustry==4)||(ghindustry==12)||(ghindustry==14)){
                        // LEFT:  +---+---+   +---+---+   +---+---+
                        //        |   |   |   |   |   |   |   | 2 |
                        //        +---+---+   +---+---+   +---+---+
                        //        | 4 |   |   | 4 | 8 |   | 4 | 8 | <- current pixel (pX,pY)
                        //        +---+---+  	+---+---+  	+---+---+
                        xa=-1;
                        ya=0;
            //            consloe.log("LEFT "+r1+" "+r2+" "+r3+" "+r4+" "+xx+" "+yy+" "+ghindustry);
                    }else if((ghindustry==2)||(ghindustry==3)||(ghindustry==7)){
                        // RIGHT: +---+---+   +---+---+   +---+---+
                        //        |   | 2 |   | 1 | 2 |   | 1 | 2 |
                        //        +---+---+   +---+---+   +---+---+
                        //        |   |   |   |   |   |   | 4 |   | <- current pixel (pX,pY)
                        //        +---+---+  	+---+---+  	+---+---+
                        xa=1;
                        ya=0;
            //            consloe.log("RIGHT "+r1+" "+r2+" "+r3+" "+r4+" "+xx+" "+yy+" "+ghindustry);
                    }else if(ghindustry==9){
                        // UNK:   +---+---+ 
                        //        | 1 |   | 
                        //        +---+---+ 
                        //        |   | 8 | <- current pixel (pX,pY)
                        //        +---+---+

                        // Turn left
                        if (ya==-1) {
                            xa=-1;
                            ya=0;
                        }else if(ya==1) {
                            xa=1;
                            ya=0;
                        }else if(xa==-1) {
                            xa=0;
                            ya=-1;
                        }else if(xa==1) {
                            xa=0;
                            ya=1;                        
                        }
                    }else if(ghindustry==6){
                        // UNK:   +---+---+ 
                        //        |   | 2 | 
                        //        +---+---+ 
                        //        | 4 |   | <- current pixel (pX,pY)
                        //        +---+---+
                        // Turn right
                        if (ya==-1) {
                            xa=1;
                            ya=0;
                        }else if(ya==1) {
                            xa=-1;
                            ya=0;
                        }else if(xa==-1) {
                            xa=0;
                            ya=1;
                        }else if(xa==1) {
                            xa=0;
                            ya=-1;                        
                        }
                    }

                    xx+=xa;
                    yy+=ya;

                    ig++;

            }

            var starttimeflood=performance.now();
            cnt=floodfill(sx,sy,r);
            var endtimeflood=performance.now();
          
            floodtime+=(endtimeflood-starttimeflood);
            
            obj={};
            obj.points=points;
            objs.push(obj);
            
            if(objs.length>200) break;

            points=[];

            gpp++;
        
        }


    }
      
    var endtime=performance.now();
  
    ctx.clearRect(0,0,1000,1000);    

    var starttime2=performance.now();
      
    reduce();
  
    var endtime2=performance.now();
  
    var totalobjs=objs.length;
    var totalpoints=0;
    var totalreduced=0;
  
    for(i=0;i<objs.length;i++){
        var obj=objs[i];
        totalpoints+=obj.points.length;
        totalreduced+=obj.reduced.length;
    }

    var tim=new Date();

    str="";
    str+=maxw;
    str+=" ,"+maxh;
    str+=" ,"+(endtime-starttime);
    str+=" ,"+(endtime2-starttime2);
    str+=" ,"+totalobjs;
    str+=" ,"+totalpoints;
    str+=" ,"+totalreduced;
    str+=" ,"+tim;
    str+=" ,"+document.getElementById('imgy').src;
    str+=" ,"+floodtime;  
    str+="\n";
    
    str=localStorage.getItem("benchmark")+str;
    localStorage.setItem('benchmark', str); 
    
    drawOutlines();

    if(repcnt>=initRepCnt){
        repcnt=0;
        rescnt++;
      
    }
    localStorage.setItem('repcnt',repcnt+1);
    localStorage.setItem('rescnt',rescnt);

    setTimeout(function(){ location.reload();  }, 1000);
}


        
        
//--------------------------------------------------------------------------
// drawOutlines
// ---------------
// draws outlines for both original and reduced object and highlights corners
//--------------------------------------------------------------------------
var cod=0;
        
function drawOutlines()
{
    var i=0;

    var sum=0;
    
    // Draw Original Curves
    
    for(i=0;i<objs.length;i++){
        var obj=objs[i];

        ctx.strokeStyle="#dcf";
        ctx.beginPath();

        for(var j=0;j<obj.points.length;j++){

            if(j>0){
                ctx.lineTo(obj.points[j].x,obj.points[j].y);
            }else{
                ctx.moveTo(obj.points[j].x,obj.points[j].y);
            }
        }
        ctx.stroke();
        
/*
        ctx.strokeStyle="#8f8";
        ctx.beginPath();
        for(var j=0;j<obj.reduced.length;j++){

            if(j>0){
                ctx.lineTo(obj.reduced[j].x,obj.reduced[j].y);
            }else{
                ctx.moveTo(obj.reduced[j].x,obj.reduced[j].y);
            }
        }
        ctx.stroke();
*/        

/*        
        ctx.strokeStyle="#8f8";
        ctx.beginPath();
        for(var j=0;j<obj.reduced.length;j++){

            if(j>0){
                ctx.lineTo(obj.reduced[j].x,obj.reduced[j].y);
            }else{
                ctx.moveTo(obj.reduced[j].x,obj.reduced[j].y);
            }
        }
        ctx.stroke();        
*/

      /*
        ctx.lineCap = 'round';
        
        ctx.strokeStyle="#000";
        for(var j=0;j<(obj.reduced.length-1);j++){
            var p1=obj.reduced[j];
            var p2=obj.reduced[j+1];
            
//            drawPencilLine(p1,p2);
            drawThickLine(p1,p2);
            
        }
        */
/*        
        var dx=ex-sx;
        var dy=ey-sy;

        len=Math.sqrt((dx*dx)+(dy*dy));
        notimes=Math.round(len/dashlen);

        dx=dx/notimes;
        dy=dy/notimes;

        var xk,yk;
        xk=sx;
        yk=sy;
        xh=dx/2.0;
        yh=dy/2.0;
        for(var i=0;i<notimes;i++){

          ctx.moveTo(xk,yk);				
          ctx.lineTo(xk+xh,yk+yh);

          xk+=dx;
          yk+=dy;
        }
*/

/*        

        var obj=objs[i];
        for(var j=0;j<obj.points.length;j++){
                if(obj.points[j].corner==1){
                    ctx.strokeStyle="#A46";
                    ctx.beginPath();

                    ctx.moveTo(obj.points[j].x+1,obj.points[j].y+1);
                    ctx.lineTo(obj.points[j].x-1,obj.points[j].y-1);

                    ctx.moveTo(obj.points[j].x+1,obj.points[j].y-1);
                    ctx.lineTo(obj.points[j].x-1,obj.points[j].y+1);
                    
                    ctx.stroke();
                }else if(obj.points[j].corner==2){
                    ctx.strokeStyle="#42A";
                    ctx.beginPath();

                    ctx.moveTo(obj.points[j].x+2,obj.points[j].y+2);
                    ctx.lineTo(obj.points[j].x-2,obj.points[j].y-2);

                    ctx.moveTo(obj.points[j].x+2,obj.points[j].y-2);
                    ctx.lineTo(obj.points[j].x-2,obj.points[j].y+2);
                    
                    ctx.stroke();
                
                }
        }
*/
        
        sum+=obj.reduced.length;
        
        
    }
    
}

//------------------------------------------------------------------------------------------------
// reduce
// ---------------
// takes a "full" point list and reduces it to an optimized subset that approximates the original
//------------------------------------------------------------------------------------------------
        
function reduce()
{
/*    
    var treshold=parseFloat(document.getElementById("tresh").value);
    document.getElementById("treshtext").value=treshold;
    
    var steps=parseFloat(document.getElementById("stepz").value);
    document.getElementById("stepztext").value=steps;
*/
    
//    steps=12;
//    treshold=0.02;

    var steps=10;
    var treshold=0.09;
    var add=15;
    var streaktreshold=0.5;
    var cornertreshold=0.15;
        
    ctx.clearRect(0,0,1000,1000);

    var j=0;
    for(var j=0;j<objs.length;j++){
        var i=add;
        var obj=objs[j];
        var redu=[];
        var hit=false;
        var streak=0;       

        // Always push first point
        redu.push(obj.points[0]);
        
/*        
        if(obj.points.length<100){
            add=6;
            hadd=Math.round(add*0.5);        
        }else{
            add=parseInt(steps);
            hadd=Math.round(add*0.5);
        }
*/

        do{
            if((i+add)>=obj.points.length) break;
            
            sx=obj.points[i].x;
            sy=obj.points[i].y;
            
            sdx=(sx-obj.points[i+add].x);
            sdy=(sy-obj.points[i+add].y);
            da=Math.atan2(sdy,sdx);
            
            cdx=(obj.points[i-add].x-sx);
            cdy=(obj.points[i-add].y-sy);
            sa=Math.atan2(cdy,cdx);
                        
            rda=Math.abs(sa-da);
            if(rda>5) rda=((Math.PI*2.0)-rda);

            var highest=-1;
            var highestindex=-1;

            if((rda>treshold&&hit==false)||streak>streaktreshold){
            
                streak=0;
                
                if(rda>cornertreshold){
                    for(k=(i+3);k<(i+add);k+=3){
                        if((k+add)>=obj.points.length) break;

                        // obj.points[k].corner=1;
                        
                        ksx=obj.points[k].x;
                        ksy=obj.points[k].y;

                        ksdx=(ksx-obj.points[k+add].x);
                        ksdy=(ksy-obj.points[k+add].y);
                        kda=Math.atan2(ksdy,ksdx);

                        kcdx=(obj.points[k-add].x-ksx);
                        kcdy=(obj.points[k-add].y-ksy);
                        ksa=Math.atan2(kcdy,kcdx);

                        krda=Math.abs(ksa-kda);
                        if(krda>5) krda=((Math.PI*2.0)-krda);
                        
                        if(krda>highest){
                            highest=krda;
                            highestindex=k;
                        }
                    }

                    if(highest>-1){
                        obj.points[highestindex].corner=2;
                        obj.points[highestindex].rda=highest;
                        i=highestindex;                    
                    }
                }else{
                    obj.points[i].corner=1;
                    obj.points[i].rda=rda;
                }
                                
                redu.push(obj.points[i]);

                if(streak>streaktreshold){
                    hit=false;
                }else{
                    hit=true;
                }
                
            }else{
                hit=false;
            }
            
            // Advance to next point and update error streak
            i+=add;
            streak+=rda;

        }while(i<obj.points.length);
        
        obj.reduced=redu;
        redu=[];
        
    }
        
    // curvize();
        
}
        
function curvize()
{
    var curve=[];
    
    var i=1;
    while(i<reduced.length-1){
        
        sx=reduced[i].x;
        sy=reduced[i].y;
        
        nx=reduced[i+1].x;
        ny=reduced[i+1].y;

        px=reduced[i-1].x;
        py=reduced[i-1].y;
        
        dx=Math.abs(Math.atan2(ny-sy,nx-sx)-Math.atan2(sy-py,sx-px));
        
        if(dx>5) dx=2*Math.PI-dx;
        
        // Either make line or quadratic curve depending on point angles
        var o;
        if(dx<0.9){
            o={k:1,p1:i-1,p2:i,p3:i+1};
            i+=2;
        }else{
            o={k:0,p1:i-1,p2:i,p3:-1};
            i+=1;
        }
        curve.push(o);
    }

    for(i=0;i<curve.length;i++){
        var obj=curve[i];
//        consloe.log(o);

        if(obj.k==0){

            // Draw line
            ctx.beginPath();
            ctx.strokeStyle="#f88";
            ctx.beginPath();
            ctx.moveTo(reduced[obj.p1].x,reduced[obj.p1].y);
            ctx.lineTo(reduced[obj.p2].x,reduced[obj.p2].y);
            ctx.stroke();
        
            // Expose points
            ctx.fillStyle="#800";

            ctx.beginPath();
            ctx.arc(reduced[obj.p1].x,reduced[obj.p1].y, 2, 0, 2.0*Math.PI, 1.0);
//            ctx.fill();    
            
        }else{
            
            ctx.beginPath();
            ctx.strokeStyle="#ddd";
            ctx.beginPath();
            ctx.moveTo(reduced[obj.p1].x,reduced[obj.p1].y);
            ctx.lineTo(reduced[obj.p2].x,reduced[obj.p2].y);
            ctx.lineTo(reduced[obj.p3].x,reduced[obj.p3].y);
            ctx.stroke();

            // Draw line
            ctx.beginPath();
            ctx.strokeStyle="#f88";
            ctx.beginPath();
            ctx.moveTo(reduced[obj.p1].x,reduced[obj.p1].y);
            ctx.quadraticCurveTo(reduced[obj.p2].x,reduced[obj.p2].y,reduced[obj.p3].x,reduced[obj.p3].y);
            ctx.stroke();
        
            // Expose points
            ctx.fillStyle="#800";
            
            // Expose point
            ctx.beginPath();
            ctx.arc(reduced[obj.p1].x,reduced[obj.p1].y, 2, 0, 2.0*Math.PI, 1.0);
//            ctx.fill();    

            ctx.fillStyle="#080";

            // Expose point
            ctx.beginPath();
            ctx.arc(reduced[obj.p2].x,reduced[obj.p2].y, 2, 0, 2.0*Math.PI, 1.0);
//            ctx.fill();    
            
        }
    }
    
    document.getElementById("consloe").innerHTML="<pre>"+reduced.length+"\n"+curve.length+"</pre>";
    
}
        
/* 
*/

        
function setuptimer()
{
//    setTimeout(function(){ partialupdate(); }, 1000);
}
