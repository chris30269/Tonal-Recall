<?php
include 'connect.php';

if($link){
	$userId = $_POST["userId"];
	$sql = "SELECT `data` FROM `userData` WHERE `userId`=$userId;";
	if ($result = mysqli_query($link, $sql)) {
		$row = mysqli_fetch_assoc($result);
		echo $row["data"];

	    /* free result set */
	    mysqli_free_result($result);
	}
}
else{
	echo "not connected";
}

?>