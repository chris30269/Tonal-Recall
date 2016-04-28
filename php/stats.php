<?php
include 'connect.php';

$temp="[";

if($link){
	$userId = $_POST["userId"];
	$sql = "SELECT `userId`, `data`, `survey`, `joined`, `consent` FROM `userData`";
	$result = mysqli_query($link, $sql);
	while ($row = mysqli_fetch_assoc($result)){
		//echo $row;
		//print_r($row);
		$temp = $temp.'{"userId":'.$row["userId"];

		if($row["data"] == "new" || $row["data"] == "") $temp = $temp.', "data":""';
		else $temp = $temp.', "data":'.$row["data"];

		if($row["survey"] == "") $temp = $temp.', "survey":""';
		else $temp = $temp.', "survey":'.$row["survey"];

		$temp = $temp.', "joined":'.$row["joined"].', "consent":'.$row["consent"].'},';
	}
	$temp = rtrim($temp, ",");
	$temp = $temp."]";
	echo $temp;
	/* free result set */
	mysqli_free_result($result);
}
else{
	echo "not connected";
}

?>