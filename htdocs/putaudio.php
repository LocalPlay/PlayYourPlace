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
if ( !validatesession() ) {
    echo '{ "status" : "FAILED", "message" : "Please login to save." }';
    exit();
}
if ($_POST) {
       define('UPLOAD_DIR', 'audio/');
       $mp3 = $_POST['mp3'];
       $mp3 = strstr( $mp3, "," );
       $ogg = $_POST['ogg'];
       $ogg = strstr( $ogg, "," );
       if ( $mp3 && $ogg ) {
		try {
			//
			// decode audio
			//
			$mp3 = str_replace(' ', '+', $mp3);
			$mp3data = base64_decode($mp3);
			$ogg = str_replace(' ', '+', $ogg);
			$oggdata = base64_decode($ogg);
            //
            // process filename
            //
            $filename = preg_replace("/[^A-Za-z0-9 .]/", '', $_REQUEST['name']);
			$mp3file = UPLOAD_DIR . time() . $filename . ".mp3";
			$success = file_put_contents($mp3file, $mp3data);
			$oggfile = UPLOAD_DIR . time() . $filename . ".ogg";
			$success = $success && file_put_contents($oggfile, $oggdata);
			//
			// add to db
			//
			if ( $success ) {
                $id = isset( $_REQUEST['id'] ) ?  $_REQUEST['id'] : 0;
				$name = $_REQUEST['name'];
				$type = $_REQUEST['type'];
				//
				// connect to database
				//
				require_once( "db.php" );
				$db = new DBConnection;
				$db->connect();
                if ( $id != 0 && $db->audioExists( $id ) ) {
                    $db->updateAudio( $id, $name, $type, $mp3file, $oggfile );
                } else {
				    //
				    // add audio
				    // 
				    $db->putAudio( $name, $type, $mp3file, $oggfile );
                }
				echo '{ "status" : "OK", "message" : "Saved file" }';
            } else {
               echo '{ "status" : "FAILED", "message" : "Unable to save file" }';
            }
       } catch ( Exception $e ) {
          echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
       }
	} else {
		echo '{ "status" : "FAILED", "message" : "Invalid audio data" }';
	//print_r( $_POST );
	}
} else {
 echo '{ "status" : "FAILED", "message" : "Invalid method"  }';
 echo $_SERVER['REQUEST_METHOD'];
 print_r( $_POST );
}
?>
