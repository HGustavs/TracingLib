<html>
  <head>
<script>
  var resarr=[];
  
  <?php
//        (\ /)
//        {o-o}           
//       c(")(")  ∴ 
//---------------------
// CREATE TABLE gdata(xres integer, yres integer, tracingtime real, vectortime real, objno integer, pointno integer, vectno integer, updtime datetime, url text, did INTEGER AUTO_INCREMENT, primary key(did));

date_default_timezone_set("Europe/Berlin");

include_once "../eurographicspw.php";
  
$pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8', DB_USER, DB_PASSWORD);
$pdo->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING );   

    $oldrow="";
    $objcnt=0;
    
    if(isset($_POST['doowap'])){

        $i=0;
        foreach($pdo->query( 'select xres,yres,AVG(tracingtime),STD(tracingtime),filenme from gdata group by yres,filenme order by filenme,xres;' ) as $row){
            
            // If current row and old row are equal
            if($oldrow!=$row[4]){
                if($i>0) echo "];";
                echo "\nresarr[".$objcnt."]=[";
                $objcnt++;
            }else{
                if(in_array($row[4],$_POST['doowap'])){
                    if($i>0) echo ",\n";                            
                }
            }
            $oldrow=$row[4];
            
            if(in_array($row[4],$_POST['doowap'])){
                echo $row[0];
                echo ",";
                echo $row[1];
                echo ",";
                echo $row[2];
                echo ",";
                echo $row[3];
                echo ",'";
                echo $row[4];
                echo "'";
            }
            $i++;
        }
        
        if($i>0) echo "];\n";     
    
      }
  

?>

    function makediagram()
    {
        var ystart=50;
        var yend=400;
        var xstart=50;
        var xend=1050;
        var arrowwidth=4;
        var arrowheight=14;
        var arrowoffs=10;
        var rulerwidth=5;
        var rulerwidths=3;

        var svgstr="";

        svgstr+="<svg width='1200' height='800' >";

        svgstr+="<defs>";
        svgstr+="<clipPath id='daClip'>";
        svgstr+="<polygon points='"+(xstart)+","+(ystart)+","+(xend)+","+(ystart)+","+(xend)+","+(yend)+","+(xstart)+","+(yend)+"' style='fill:black;stroke:none;' />";
        svgstr+="</clipPath>";
        svgstr+="</defs>";

        // Demo line
        // svgstr+="<polyline points='20,20 40,25 60,40 80,120 120,140 200,180' style='fill:none;stroke:black;stroke-width:3' />";

        var colorz=["#5e5","#e55","#55e"];
      
        var itemsize=5;
        for(var j=0;j<resarr.length;j++){
            // Main diagram Line
            if(resarr[j].length>0){
                svgstr+="<polyline clip-path='url(#daClip)' points='";
                var kb=0;
                for(i=0;i<resarr[j].length;i+=itemsize){
                    xk=xstart+Math.round(resarr[j][i+1]);
                    yk=yend-Math.round(resarr[j][i+2]);
                    if(kb>0) svgstr+=",";
                    svgstr+=xk+","+yk;
                    kb++;
                }
                svgstr+="' style='fill:none;stroke:"+colorz[j]+";stroke-width:2' />";

                // Error bar fill
                var sg=0;
                do{
                    svgstr+="<polygon clip-path='url(#daClip)' points='";
                    
                    var sstart=sg;
                    var ssend=sg+(10*itemsize);
                    if(ssend>resarr[j].length) ssend=resarr[j].length;
                  
                    for(i=sstart;i<ssend;i+=itemsize){
                        xk=xstart+Math.round(resarr[j][i+1]);
                        yk=yend-(Math.round(resarr[j][i+2])-Math.round(resarr[j][i+3]));
                        if(i>sstart) svgstr+=",";
                        svgstr+=xk+","+yk;
                    }
                    for(i=ssend-itemsize;i>=sstart;i-=itemsize){
                        xk=xstart+Math.round(resarr[j][i+1]);
                        yk=yend-(Math.round(resarr[j][i+2])+Math.round(resarr[j][i+3]));
                        svgstr+=","+xk+","+yk;
                    }
                    svgstr+="' style='fill:"+colorz[j]+";stroke:none;stroke-width:1;fill-opacity:0.25' />"
                  
                    sg+=(9*itemsize);
                  
                }while(sg<resarr[j].length);
              
            }
        }

        // Vert ruler
        for(i=20;i<=300;i+=20){
            if((i%100)==0){
                svgstr+="<line x1='"+(xstart-rulerwidth)+"' y1='"+(yend-i)+"' x2='"+(xstart+rulerwidth)+"' y2='"+(yend-i)+"' stroke-width='2' stroke='black'/>";
                svgstr+="<text font-family='Arial' x='"+(xstart-8)+"' y='"+(yend-i+1)+"' fill='black' text-anchor='end' dominant-baseline='central'>"+i+"</text>";
            }else{
                svgstr+="<line x1='"+(xstart-rulerwidths)+"' y1='"+(yend-i)+"' x2='"+(xstart+rulerwidths)+"' y2='"+(yend-i)+"' stroke-width='2' stroke='black'/>";
            }
        }

        // Horz ruler
        for(i=50;i<=1000;i+=50){
            if((i%200)==0){
                svgstr+="<line x1='"+(xstart+i)+"' y1='"+(yend-rulerwidth)+"' x2='"+(xstart+i)+"' y2='"+(yend+rulerwidth)+"' stroke-width='2' stroke='black'/>";
                svgstr+="<text font-family='Arial' x='"+(xstart+i)+"' y='"+(yend+7)+"' fill='black' text-anchor='middle' dominant-baseline='text-before-edge'>"+i+"</text>";
            }else{
                svgstr+="<line x1='"+(xstart+i)+"' y1='"+(yend-rulerwidths)+"' x2='"+(xstart+i)+"' y2='"+(yend+rulerwidths)+"' stroke-width='2' stroke='black'/>";
            }
        }

        // Vertical Line and Arrow
        svgstr+="<polygon points='"+(xstart-arrowwidth)+","+(ystart-arrowoffs)+","+(xstart+arrowwidth)+","+(ystart-arrowoffs)+","+(xstart)+","+(ystart-arrowheight-arrowoffs)+"' style='fill:black;stroke:none;' />";
        svgstr+="<line x1='"+xstart+"' y1='"+(ystart-arrowheight)+"' x2='"+xstart+"' y2='"+yend+"' stroke-width='2' stroke='black'/>";

        // Horizontal Arrow
        svgstr+="<polygon points='"+(xend+arrowoffs)+","+(yend-arrowwidth)+","+(xend+arrowoffs)+","+(yend+arrowwidth)+","+(xend+arrowoffs+arrowheight)+","+(yend)+"' style='fill:black;stroke:none;' />";
        svgstr+="<line x1='"+(xstart)+"' y1='"+yend+"' x2='"+(xend+arrowoffs)+"' y2='"+yend+"' stroke-width='2' stroke='black'/>";

        var oarr=[];
        for(var i=0;i<resarr.length;i++){
            var inh=resarr[i];
            for(var j=0;j<inh.length;j+=5){
                var datag=inh[j+4];
                oarr[datag]=i;
            }
        }

        var yk=0;
        var legendx=500;
        var legendwidth=55;
        var legendheight=20;
        for(var key in oarr){
            yk+=25;

            svgstr+="<polygon points='"+(legendx)+","+(yk)+","+(legendx+legendwidth)+","+(yk)+","+(legendx+legendwidth)+","+(yk+legendheight)+","+(legendx)+","+(yk+legendheight)+"' style='fill:"+colorz[oarr[key]]+";stroke:none;stroke-width:2;fill-opacity:0.25;' />";
            svgstr+="<polyline points='"+(legendx)+","+(yk+(legendheight*0.5))+","+(legendx+legendwidth)+","+(yk+(legendheight*0.5))+"' style='fill:"+colorz[oarr[key]]+";stroke:"+colorz[oarr[key]]+";stroke-width:2;fill-opacity:0.25;' />";
            svgstr+="<text font-family='Arial' x='"+(legendx+legendwidth+4)+"' y='"+(yk+(legendheight*0.5))+"' fill='black' text-anchor='start' dominant-baseline='central'>"+key+"</text>";

        }
      
        // End of svg string
        svgstr+="</svg>";


        document.getElementById("booyah").innerHTML=svgstr;
    }
    </script>
  </head>
  <body onload="makediagram();">
    <form action="showdata1c.php" method="POST">
      <select name="doowap[]" multiple="multiple">
        
        <?php
              
        foreach($pdo->query("select distinct(filenme) from gdata;") as $row){
            echo "<option>";
            echo $row['filenme'];			
            echo "</option>";
        }
        
        ?>
      </select>
      
      <button>GO!</button>

    </form>
    
    <div id="booyah"></div>
  </body>
</html>
