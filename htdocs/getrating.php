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
      $category	  = $_GET[ 'category' ];
      $tablename	= $_GET[ 'tablename' ];
      $targetid	  = $_GET[ 'targetid' ];
      $result	= $db->getRating( $category, $tablename, $targetid );
      $count = mysql_numrows( $result );
      if ( $count > 0 ) {
        //
        // average score
        //
        $score = 0;
        for ( $i = 0; $i < $count; $i++ ) {
            $score += mysql_result( $result, 0, 'score' );
        }
        $score /= $count;
        //
        // encode response
        //
        $response = array( "status" => "OK", "category" => $category, "tablename" => $tablename, "targetid" => $targetid, "score" => $score ); 
        echo json_encode( $response );
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
