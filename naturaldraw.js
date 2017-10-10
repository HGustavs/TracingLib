var cod=0;

// Hash - part of pseudorandom noise
function hash(n){
//var val=sintab[Math.round(n)%2000];
var val=Math.sin(n)*43758.5453123;
return val-Math.floor(val); 
}

// Pseudorandom 2D noise
function noise(xk,yk)
{
  return hash(xk+(yk*(xk+50)));
}

// Cellular Noise
function cellNoise(xk,yk)
{
  xk=Math.floor(xk);
  yk=Math.floor(yk);

  return noise(xk,yk);    
}
    
// Pseudorandom 2D smooth noise
function smoothNoise(xk,yk)
{

  fx=xk-Math.floor(xk);
  fy=yk-Math.floor(yk);

  xk=Math.floor(xk);
  yk=Math.floor(yk);

  var x1=noise(xk,yk);
  var x2=noise(xk+1,yk);

  var x3=noise(xk,yk+1);
  var x4=noise(xk+1,yk+1);

  var y1=x1+((x2-x1)*fx);
  var y2=x3+((x4-x3)*fx);

  //return hash(xk+(yk*(xk+50)));
  return y1+((y2-y1)*fy);
}
			

// Pseudorandom 2D smooth noise
function smoothNoiseCos(xk,yk)
{

  fx=xk-Math.floor(xk);
  fy=yk-Math.floor(yk);

  fx=1-(0.5*(Math.cos(fx*3.1415)+1));
  fy=1-(0.5*(Math.cos(fy*3.1415)+1));

  xk=Math.floor(xk);
  yk=Math.floor(yk);

  var x1=noise(xk,yk);
  var x2=noise(xk+1,yk);

  var x3=noise(xk,yk+1);
  var x4=noise(xk+1,yk+1);

  var y1=x1+((x2-x1)*fx);
  var y2=x3+((x4-x3)*fx);

  //return hash(xk+(yk*(xk+50)));
  return y1+((y2-y1)*fy);
}

function cosjitter(xk,yk)
{
  var scale=0.1;
  
  var val=0;

  val += Math.cos((xk+(Math.sin(yk*0.02)*50))*0.1);
  val += Math.cos((yk+(Math.sin(xk*0.01)*70))*0.1);
  
  return val;
}
        
function drawDashedLine(sx,sy,ex,ey,dashlen)
{

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
}

//--------------------------------------------------------------------------
// drawLine
// ---------------
// draws a line using specific styles
//--------------------------------------------------------------------------

function drawStyledLine(p1,p2)
{   
        var dashlen=2;
        var shakeamnt=1;
    
        var dx=p2.x-p1.x;
        var dy=p2.y-p1.y;

        var len=Math.sqrt((dx*dx)+(dy*dy));
        var notimes=Math.round(len/dashlen);

        ddx=-dy/len;
        ddy=dx/len;

        dx=dx/notimes;
        dy=dy/notimes;

        var xk=p1.x-dx;
        var yk=p1.y-dy;
        //            var xk=p1.x;
        //            var yk=p1.y;

        var dk=(Math.PI)/notimes;

        var ox=xk;
        var oy=yk;

        // var rxk=xk+(cellNoise(xk,yk)*shakeamnt);
        // var ryk=yk+(cellNoise(xk+44,yk+12)*shakeamnt);
        // var rxk=xk+(Math.sin((xk+yk)*0.1)*shakeamnt);
        // var ryk=yk+(Math.cos((xk-yk+12)*0.1)*shakeamnt);

        var ox=xk+(ddx*3);
        var oy=yk+(ddy*3);

//        rxk=0;
//        ryk=0;
    
        xk+=dx;
        yk+=dy;

        ctx.globalAlpha=0.1;
        for(var k=0;k<(notimes+1);k++){
            cod+=0.05;

            // rxk=xk+(cellNoise(xk,yk)*shakeamnt);
            // ryk=yk+(cellNoise(xk+44,yk+12)*shakeamnt);
            // rxk=xk+(Math.sin((xk+yk)*0.1)*shakeamnt);
            // ryk=yk+(Math.cos((xk-yk+12)*0.1)*shakeamnt);
            
            rxk=xk+(Math.random()*ddx*5);
            ryk=yk+(Math.random()*ddy*5);

            // ctx.lineWidth=0.5+(Math.abs(Math.sin(cod))*0.5);
            // ctx.lineWidth=1.5;
            //ctx.globalAlpha=0.3+(Math.abs(Math.sin(cod))*0.8);

            // ctx.beginPath();
            // ctx.moveTo(ox,oy);
            // ctx.lineTo(rxk,ryk);

            // ctx.moveTo(xk,yk);
            // ctx.lineTo(xk+dx,yk+dy);
            // ctx.stroke();

            for(var n=0;n<5;n++){
                ctx.beginPath();
                ctx.arc(xk+(Math.random()*ddx*6), yk+(Math.random()*ddy*6) , 1.5, 0, 2 * Math.PI, false);
                ctx.fill();            
            }
            
            ox=rxk;
            oy=ryk;

            xk+=dx;
            yk+=dy;    

        }

}
 
//--------------------------------------------------------------------------
// drawLine
// ---------------
// draws a line using specific styles
//--------------------------------------------------------------------------
function drawThickLine(p1,p2)
{   
        var dashlen=5;
        var shakeamnt=0;
        var linethick=0.6;
        var linejitteramt=1.0;
        var jitteramt=0.8;
      
        var dx=p2.x-p1.x;
        var dy=p2.y-p1.y;

        var len=Math.sqrt((dx*dx)+(dy*dy));
        var notimes=Math.round(len/dashlen);

        ctx.fillStyle="Black";
  
        ddx=-dy/len;
        ddy=dx/len;

        dx=dx/notimes;
        dy=dy/notimes;

        var xk=p1.x-dx;
        var yk=p1.y-dy;

        ctx.globalAlpha=1.0;
        
        ctx.beginPath();
        ctx.moveTo(xk,yk);

        xk+=dx;
        yk+=dy;
  
        for(var k=0;k<(notimes+1);k++){

            var jitter=linethick+(cellNoise(xk,yk)*2.0)*jitteramt;
            var ljitterx=cosjitter(xk,yk);
            var ljittery=cosjitter(yk,xk);
          
            rxk=xk+(ddx*jitter)+(ddx*ljitterx*linejitteramt);
            ryk=yk+(ddy*jitter)+(ddy*ljittery*linejitteramt);
            
            ctx.lineTo(rxk,ryk);

            xk+=dx;
            yk+=dy;    
        }

        xk-=dx;
        yk-=dy;
  
        for(var k=0;k<(notimes+1);k++){

            var jitter=linethick+(cellNoise(xk+44,yk)*2.0)*jitteramt;
            var ljitterx=cosjitter(xk,yk);
            var ljittery=cosjitter(yk,xk);
          
            rxk=xk-(ddx*jitter)+(ddx*ljitterx*linejitteramt);
            ryk=yk-(ddy*jitter)+(ddy*ljittery*linejitteramt);
            
            ctx.lineTo(rxk,ryk);

            xk-=dx;
            yk-=dy;    
        }
    
        ctx.stroke();
        ctx.fill();

}
        
//--------------------------------------------------------------------------
// drawLine
// ---------------
// draws a line using specific styles
//--------------------------------------------------------------------------
function drawPencilLine(p1,p2)
{   
        var dashlen=2;
    
        var dx=p2.x-p1.x;
        var dy=p2.y-p1.y;

        var len=Math.sqrt((dx*dx)+(dy*dy));
        var notimes=Math.round(len/dashlen);

        ddx=-dy/len;
        ddy=dx/len;

        dx=dx/notimes;
        dy=dy/notimes;

        var xk=p1.x-dx;
        var yk=p1.y-dy;

        var dk=(Math.PI)/notimes;

        var ox=xk;
        var oy=yk;

        var ox=xk+(ddx*3);
        var oy=yk+(ddy*3);

        xk+=dx;
        yk+=dy;

        ctx.globalAlpha=0.1;

        for(var k=0;k<(notimes+1);k++){
            for(var n=0;n<5;n++){
                ctx.beginPath();
                ctx.arc(xk+(Math.random()*ddx*6), yk+(Math.random()*ddy*6) , 1.5, 0, 2 * Math.PI, false);
                ctx.fill();            
            }
            
            xk+=dx;
            yk+=dy;    
        }

}

