<?php
include 'connect.php';

if($link){
	//check if we're over IRB limit
	$sql = "SELECT * FROM `userData` WHERE 1";
	if($result = mysqli_query($link, $sql)){
		$num = mysqli_num_rows($result);
		mysqli_free_result($result);

		if ($num <= $IRBallowed) {
			$sql = "INSERT INTO `userData`(`data`) VALUES ('new');";
			if ($result = mysqli_query($link, $sql)) {
				echo mysqli_insert_id($link);

			    /* free result set */
			    mysqli_free_result($result);
			}
		}
		else{
			//so many people!!!
		}
	}
}
else{
	echo "not connected";
}

?>