/*
 *    Copyright (C) 2013 Local Play
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License as
 *    published by the Free Software Foundation, either version 3 of the
 *    License, or (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
