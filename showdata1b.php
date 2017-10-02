<?php

//        (\ /)
//        (. .)    .       
//       c(”)(”)  ::: 
//---------------------
// CREATE TABLE gdata(xres integer, yres integer, tracingtime real, vectortime real, objno integer, pointno integer, vectno integer, updtime datetime, url text, did INTEGER AUTO_INCREMENT, primary key(did));

date_default_timezone_set("Europe/Berlin");

$datan = file_get_contents('data_test1.csv');
$dataarr=explode("\n", $datan);

$pdo = new PDO('mysql:dbname=eurographicsdata;host=localhost', 'mylogin', 'mypassword');
$pdo->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING );   

echo "var resarr=[";
$i=0;
foreach($pdo->query( 'select xres,yres from gdata group by yres;' ) as $row){
    if($i>0) echo ",";
    echo $row[0];
    echo ",";
    echo $row[1];
    $i++;
}
echo "];";

?>