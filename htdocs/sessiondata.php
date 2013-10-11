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
    require_once( "session.php" );
    if ( validatesession() ) {
		$sessiondata = array( 'status' => 'OK', 'message' => 'loggedin', 'creatorid' => $_SESSION[ 'creatorid' ], 'creatorname' => $_SESSION[ 'creatorname' ], 'creatorrole' => $_SESSION[ 'creatorrole' ] );
		header('Cache-Control: no-cache, must-revalidate');
		header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
		header('Content-type: application/json');
		echo json_encode($sessiondata);
	} else {
        echo '{ "status" : "FAILED", "message" : "Session expired" }';
    }
?>
