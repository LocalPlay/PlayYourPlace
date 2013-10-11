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
	//
	// validate session
	//
    require_once( "session.php" );
    if ( !validatesession() ) {
        //header( 'Location: index.html' ) ;
        echo '{ "status" : "FAILED", "message" : "Please login to save." }';
        exit();
    }
    define('UPLOAD_DIR', 'uploads/');
	if ($_POST) {
	try {
            //
            // create upload directory
            //
            $uploaddir = UPLOAD_DIR . date('Ymd');
            if ( !file_exists($uploaddir) ) {
                mkdir($uploaddir);
            }
			//
			// connect to database
			//
			require_once( "db.php" );
			$db = new DBConnection;
			$db->connect();
			//
			// add level
			//
			$id			= isset( $_REQUEST[ 'id' ] ) ? $_REQUEST[ 'id' ] : "0";
			$name		= addslashes($_REQUEST[ 'name' ]);
			$place		= addslashes($_REQUEST[ 'place' ]);
			$action		= addslashes($_REQUEST[ 'change' ]);
            $publshed   = $_REQUEST[ 'published' ];
			$creator	= $_SESSION[ 'creatorid' ];
            if ( isset( $_POST[ 'thumbnail' ] ) ) {
                $thumbnail = $_POST[ 'thumbnail' ];
                $thumbnail = strstr( $thumbnail, "," ); 
                $thumbnail_path = $uploaddir . $creator . time() . "level-thumbnail.png";
                $thumbnail = str_replace(' ', '+', $thumbnail);
                $data = base64_decode($thumbnail);
   		        $success = file_put_contents( $thumbnail_path, $data);
                if ( !$success ) {
                    $thumbnail_path = $_REQUEST[ 'thumbnail' ];
                }
               
            } else {
			          $thumbnail_path	= $_REQUEST[ 'thumbnail' ];
            }
			$tags	= $_REQUEST[ 'tags' ];
			$json	= addslashes($_POST[ 'data' ]);
			if ( $id != "0" &&  $db->levelExistsForCreator( $id, $creator ) ) {
				$db->updateLevel( $id, $name, $place, $action, $thumbnail_path, $tags, $json, $publshed );
			} else {
                //
                // get unique name
                //
                $originalid = $id;
                $name = $db->getUniqueNameForLevel( 0, $name );
				$id = $db->putLevel( $name, $place, $action, $creator, $thumbnail_path, $tags, $json, $publshed );
                if ( $originalid != 0 ) {
                    $db->addAttribution( $id, $originalid );
                }
			}
            $name = htmlentities( stripslashes( $name ) );
			echo '{ "status" : "OK", "message" : "Saved level \'' . $name . '\'<p><img src=\''. $thumbnail_path . '\' /></p>", "id" : ' . $id . ', "name" : "' . $name . '" }';
		} catch( Exception $e ) {
			echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
		}
	} else {
		echo '{ "status" : "FAILED", "message" : "Invalid method" }';
	}

?>
