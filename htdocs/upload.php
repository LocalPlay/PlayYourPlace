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
    define('UPLOAD_DIR', 'uploads/');
    $img = $_POST['data'];
       $img = strstr( $img, "," );
       if ( $img ) {
		try {
            //
            // create upload directory
            //
            $uploaddir = UPLOAD_DIR . date('Ymd');
            if ( !file_exists($uploaddir) ) {
                mkdir($uploaddir);
            }
            $uploaddir .= "/";
			//
			// decode image
			//
			$img = str_replace(' ', '+', $img);
			$data = base64_decode($img);
            //
            // process filename
            //
            $filename = preg_replace("/[^A-Za-z0-9 .]/", '', $_REQUEST['filename']);
			$file = $uploaddir . time() . $filename;
			$success = file_put_contents($file, $data);
			//
			// add to db
			//
			if ( $success ) {
                $id = isset( $_REQUEST['id'] ) ?  $_REQUEST['id'] : 0;
				$name = addslashes(isset( $_REQUEST['name'] ) && strlen( $_REQUEST['name'] ) > 0 ? $_REQUEST['name'] : $_REQUEST['filename']);
				$tags = isset( $_REQUEST['tags'] ) ? urldecode( $_REQUEST['tags'] ) : "";
				$type = isset( $_REQUEST['type'] ) ? $_REQUEST['type'] : "object";
				//
				// check for thumbnail
				//
				$thumbnail = isset( $_POST[ 'thumbnail' ] ) ? $_POST[ 'thumbnail' ] : null;
				$thumbnail_path = "";
				if ( $thumbnail &&  ( $thumbnail = strstr( $thumbnail, "," ) ) ) {
				  $thumbnail_path = $uploaddir . time() . "thumbnail" . $filename;
				  $thumbnail = str_replace(' ', '+', $thumbnail);
				  $data = base64_decode($thumbnail);
				  $success = file_put_contents( $thumbnail_path, $data);
				  if ( !$success ) {
				    $thumbnail_path = "";
				  }
				} 
				//
				// connect to database
				//
				require_once( "db.php" );
				$db = new DBConnection;
				$db->connect();
                if ( $id != 0 && $db->mediaExistsForCreator( $id, $_SESSION[ 'creatorid' ] ) ) {
                    $db->updateMedia( $id, $name, $_SESSION[ 'creatorid' ], $file, $type, $tags, $thumbnail_path );
                } else {
				    //
				    // add media
				    // $name, $creator, $path, $type
				    $db->putMedia( $name, $_SESSION[ 'creatorid' ], $file, $type, $tags, $thumbnail_path );
                }
				echo '{ "status" : "OK", "message" : "Saved file" }';
            } else {
               echo '{ "status" : "FAILED", "message" : "Unable to save file" }';
            }
       } catch ( Exception $e ) {
          echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
       }
	} else {
		echo '{ "status" : "FAILED", "message" : "Invalid image data" }';
	//print_r( $_POST );
	}
} else {
 echo '{ "status" : "FAILED", "message" : "Invalid method" }';
}
?>
