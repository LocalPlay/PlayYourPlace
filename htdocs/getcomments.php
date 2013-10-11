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
    if ( !validatesession() || $_SESSION['creatorrole'] < 1 ) {
        echo '{ "status" : "FAILED", "message" : "You do not have permission to read comments!" }';
        exit();
    }
    //
    //
    //
      if ($_GET) {
        try {
            //
            // connect to database
            //
            require_once( "db.php" );
            $db = new DBConnection;
            $db->connect();
            //
            // get parameters 
            //
            $tablename	= $_GET[ 'tablename' ];
            $targetid	= $_GET[ 'targetid' ];
            //
            //
            //
            $command = "SELECT * FROM comment WHERE tablename='$tablename' AND targetid='$targetid';";
            $result = $db->executeCommand( $command );
            $count = mysql_numrows( $result );
            $response = array();
            for ( $i = 0; $i < $count; $i++ ) {
                $entry = array();
                $id =  mysql_result( $result, $i, "id" );
                $entry[ "id" ] = $id;
                $entry[ "tablename" ] = $tablename;
                $creatorid = mysql_result( $result, $i, "creatorid" );
                $creatorname = $db->getCreatorName( $creatorid );
                $entry[ "creator" ] = $creatorname == null ? "" : $creatorname;
                $entry[ "creatorid" ] = $creatorid;
                $entry[ "creatoremail" ] = $db->getCreatorEmail( $creatorid );
                $entry[ "comment" ] = mysql_result( $result, $i, "comment" );
                $response[ $i ] = $entry;
            }
          echo json_encode($response);
        } catch( Exception $e ) {
          echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
        }
      } else {
        echo '{ "status" : "FAILED", "message" : "Invalid method" }';
      }

?>
