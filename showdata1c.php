<html>
  <head>
<script>
  var resarr=[];
  
  <?php
//        (\ /)
//        (. .)    .       
//       c(”)(”)  ::: 
//---------------------
// CREATE TABLE gdata(xres integer, yres integer, tracingtime real, vectortime real, objno integer, pointno integer, vectno integer, updtime datetime, url text, did INTEGER AUTO_INCREMENT, primary key(did));

date_default_timezone_set("Europe/Berlin");

$pdo = new PDO('mysql:dbname=eurographicsdata;host=localhost', 'wikiadmin', 'kingfisher');
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
                if($i>0) echo ",\n";            
            }
            $oldrow=$row[4];
          
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
            $i++;
        }
        
        if($i>0) echo "];\n";     
    
      }
  

?>

    function makediagram()
    {
        var ystart=50;
        var yend=250;
        var xstart=50;
        var xend=1050;
        var arrowwidth=4;
        var arrowheight=14;
        var arrowoffs=10;
        var rulerwidth=5;
        var rulerwidths=3;

        var svgstr="";

        svgstr+="<svg width='1200' height='600' >";

        svgstr+="<defs>";
        svgstr+="<clipPath id='daClip'>";
        svgstr+="<polygon points='"+(xstart)+","+(ystart)+","+(xend)+","+(ystart)+","+(xend)+","+(yend)+","+(xstart)+","+(yend)+"' style='fill:black;stroke:none;' />";
        svgstr+="</clipPath>";
        svgstr+="</defs>";

        // Demo line
        // svgstr+="<polyline points='20,20 40,25 60,40 80,120 120,140 200,180' style='fill:none;stroke:black;stroke-width:3' />";

        var colorz=["#5e5","#e55","#55e"];
      
        for(var j=0;j<resarr.length;j++){
            // Main diagram Line
            svgstr+="<polyline clip-path='url(#daClip)' points='";
            for(i=0;i<resarr[j].length;i+=5){
                xk=xstart+Math.round(resarr[j][i+1]);
                yk=yend-Math.round(resarr[j][i+2]);
                if(i>0) svgstr+=",";
                svgstr+=xk+","+yk;
            }
            svgstr+="' style='fill:none;stroke:"+colorz[j]+";stroke-width:2' />"

            // Error bar fill
            svgstr+="<polygon clip-path='url(#daClip)' points='";
            for(i=0;i<resarr[j].length;i+=5){
                xk=xstart+Math.round(resarr[j][i+1]);
                yk=yend-(Math.round(resarr[j][i+2])-Math.round(resarr[j][i+3]));
                if(i>0) svgstr+=",";
                svgstr+=xk+","+yk;
            }
            for(i=resarr[j].length-5;i>=0;i-=5){
                xk=xstart+Math.round(resarr[j][i+1]);
                yk=yend-(Math.round(resarr[j][i+2])+Math.round(resarr[j][i+3]));
                if(i>0) svgstr+=",";
                svgstr+=xk+","+yk;
            }
            svgstr+="' style='fill:"+colorz[j]+";stroke:none;stroke-width:1;fill-opacity:0.25' />"
          
        }
          


        // Vert ruler
        for(i=20;i<=200;i+=20){
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

        // End of svg string
        svgstr+="</svg>";


        document.getElementById("booyah").innerHTML=svgstr;
    }
    </script>
  </head>
  <body onload="makediagram();">

    <form action="showdata1c.php" method="POST">
      <select name="doowap" multiple="multiple">
        
        <?php
        
        print_r($_POST);
        
        //        (\ /)
        //        (. .)    .       
        //       c(”)(”)  ::: 
        //---------------------
        
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