<?php

//        (\ /)
//        (. .)           
//       c(”)(”)    . 
//---------------------
// CREATE TABLE gdata(xres integer, yres integer, tracingtime real, vectortime real, objno integer, pointno integer, vectno integer, updtime datetime, url text, did INTEGER AUTO_INCREMENT, filenme varchar(128), primary key(did));

date_default_timezone_set("Europe/Berlin");

$datan = $_POST['benchmark'];
$filename = $_POST['m']

$dataarr=explode("\n", $datan);

$pdo = new PDO('mysql:dbname=eurographicsdata;host=localhost', 'wikiadmin', 'kingfisher');
$pdo->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING );

$sql = 'DELETE FROM gdata WHERE filenme=:filenme);';
$stmt = $pdo->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
$stmt->bindParam(':filenme', $filename);

foreach($dataarr as $key => $value){
    $dataarrz=explode(",", $value);
  print_r($dataarrz);
    if(count($dataarrz)>5){
        $sql = 'INSERT INTO gdata(xres,yres,tracingtime,vectortime, objno, pointno, vectno, updtime, url,filenme) VALUES(:xres,:yres,:tracingtime,:vectortime,:objno,:pointno,:vectno,:updtime,:url,:filenme);';
        $stmt = $pdo->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_SCROLL));
        $stmt->bindParam(':xres', $dataarrz[0]);
        $stmt->bindParam(':yres', $dataarrz[1]);
        $stmt->bindParam(':tracingtime', floatval($dataarrz[2]));
        $stmt->bindParam(':vectortime', floatval($dataarrz[3]));
        $stmt->bindParam(':objno', floatval($dataarrz[4]));
        $stmt->bindParam(':pointno', floatval($dataarrz[5]));
        $stmt->bindParam(':vectno', floatval($dataarrz[6]));
        $stmt->bindParam(':updtime', date("Y-m-d H:i:s",strtotime($dataarrz[7])));
        $stmt->bindParam(':url', $dataarrz[8]);
        $stmt->bindParam(':filenme', $datastr);
        $stmt->execute();
    }
      
}

//print_r($dataarr);

?>