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
    //exit();
  }
  if ($_GET) {
    try {
      //
      // connect to database
      //
      require_once( "db.php" );
      $db = new DBConnection;
      $db->connect();
      //
      // get rating
      //
      $id       = isset( $_GET[ 'id' ] ) ? $_GET[ 'id' ] : 0;
      $type     = isset( $_GET[ 'type' ] ) ? $_GET[ 'type' ] : "none";
      $result   = $db->getAudio( $id, $type );
      $count = mysql_numrows( $result );
      if ( $count > 0 ) {
        $audio = null;
        if ( $id !== 0 ) {
            $audio = array( "id" => $id, "name" => mysql_result( $result, 0, 'name' ), "type" => mysql_result( $result, 0, 'type' ), "mp3" => mysql_result( $result, 0, 'mp3' ), "ogg" => mysql_result( $result, 0, 'ogg' ) ); 
        } else {
            $audio = array();
            for ( $i = 0; $i < $count; $i++ ) {
                $entry = array( "id" => mysql_result( $result, $i, 'id' ), "name" => mysql_result( $result, $i, 'name' ), "type" => mysql_result( $result, $i, 'type' ), "mp3" => mysql_result( $result, $i, 'mp3' ), "ogg" => mysql_result( $result, $i, 'ogg' ) );
                array_push( $audio, $entry );
            }
        }
        $json = json_encode( $audio );
        echo '{ "status" : "OK", "message" : { "data" : ' . $json . ' } }';
      } else {
        echo '{ "status" : "FAILED", "message" : "No entry" }';
      }
			
    } catch( Exception $e ) {
      echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
    }
  } else {
    echo '{ "status" : "FAILED", "message" : "Invalid method" }';
  }
?>
