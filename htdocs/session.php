<?php
function createsession( $creatorid, $creatorname, $creatorrole ) {
	try {
		session_start();
	} catch( Exception $e) {

	}
	$_SESSION['creatorid'] = $creatorid;
	$_SESSION['creatorname'] = $creatorname;
	$_SESSION['creatorrole'] = $creatorrole;
	$_SESSION['creatorip'] = $_SERVER['REMOTE_ADDR'];
}

function validatesession() {
	try {
		session_start();
	} catch( Exception $e) {

	}
	if ( isset( $_SESSION['creatorid'] ) && isset( $_SESSION['creatorip'] ) && $_SESSION['creatorip'] == $_SERVER['REMOTE_ADDR'] ) {
		return true;
	}
	return false;
}

function endsession() {
	try {
		session_start();
	} catch( Exception $e) {

	}
	unset( $_SESSION['creatorid'] );
	unset( $_SESSION['creatorname'] );
	unset( $_SESSION['creatorip'] );
}

function printsession() {
	try {
		session_start();
	} catch( Exception $e) {

	}

	echo $_SESSION['creatorid'] . "|" . $_SESSION['creatorname'] . "|" . $_SESSION['creatorip'];
}
?>
