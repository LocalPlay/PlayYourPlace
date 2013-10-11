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
        echo '{ "status" : "FAILED", "message" : "You are not registered as an administrator" }';  
        exit();
    }
    $method = $_SERVER[ 'REQUEST_METHOD' ];
    if ( strcmp( $method, 'GET' ) == 0 ) {
        try {
            //
            // connect to database
            //
            require_once( "db.php" );
            $db = new DBConnection;
            $db->connect();
            //
            //
            //
            $response = array();
            $response[ 'status' ] = "OK";
            //
            // count creators
            //
            $response[ 'creatorcount' ] = $db->count( "creator", "" );
            //
            // count number of creators who have created one or more levels
            //
            $result = $db->executeCommand( "SELECT COUNT( DISTINCT creator.id ) as makers FROM creator INNER JOIN level WHERE level.creator = creator.id;" );
            $response[ 'activemakers' ] = mysql_result( $result, 0, "makers" );
            //
            // count number of creators who have played one or more games
            //
            $result = $db->executeCommand( "SELECT COUNT( DISTINCT creator.id ) as players FROM creator INNER JOIN score ON score.creatorid = creator.id;" );
            $response[ 'activeplayers' ] = mysql_result( $result, 0, "players" );
            //
            // count levels
            //
            $response[ 'levelcount' ] = $db->count( "level", "" );
            //
            // count levels which have been played one or more times
            //
            $result = $db->executeCommand( "SELECT COUNT( DISTINCT level.id ) as levels FROM level INNER JOIN score ON score.levelid = level.id;" );
            $response[ 'activelevels' ] = mysql_result( $result, 0, "levels" );
            //
            // 
            //
            echo json_encode($response);
        } catch( Exception $e ) {
            echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
        }
    } else {
        echo '{ "status" : "FAILED", "message" : "invalid method : ' . $_SERVER[ 'REQUEST_METHOD' ] . '" }';
    }
    function buildCondition( $filter ) {
        $conditions =  "";
        if ( strlen( $filter ) > 0 ) {
            $conditions .= "WHERE ( creator.name LIKE '%$filter%' ) "; 
        }
        if ( strlen( $conditions ) > 0 ) {
            $conditions .= " AND creator.id != " . $_SESSION['creatorid'] . " ";
        } else {
            $conditions .= "WHERE creator.id != " . $_SESSION['creatorid'] . " ";
        }
       return$conditions;
    }
?>
