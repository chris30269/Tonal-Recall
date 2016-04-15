<?php
include 'connect.php';

if($link){
	$userId = $_POST["userId"];
	$responses = $_POST["responses"];
	if($_POST["action"] == "save"){
		$responses = addslashes($responses);
		$sql = 'UPDATE `userData` SET `survey`=\''.$responses.'\' WHERE `userId`='.$userId.';';
		if (mysqli_query($link, $sql)) {
			echo "success";

		    /* free result set */
		    mysqli_free_result($result);
		}
	}

	if($_POST["action"] == "load"){
		$sql = "SELECT `survey` FROM `userData` WHERE `userId`=$userId;";
		if ($result = mysqli_query($link, $sql)) {
			$row = mysqli_fetch_assoc($result);
			echo stripslashes($row["survey"]);

		    /* free result set */
		    mysqli_free_result($result);
		}
	}
	
}
else{
	echo "not connected";
}

?>