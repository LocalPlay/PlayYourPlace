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
            // update creator record
            //
            $id = isset( $_GET[ 'id' ] ) ? preg_replace("/[^0-9]/", "", $_GET[ 'id' ] ) : 0;
            if ( $id == 0 || $db->getCreatorName( $id ) == null ) {
                throw new Exception( "We can't find your account, please try to join again" );
            }
            $db->verifyCreator($id);
            //
            // initialise session
            //
            require_once( "session.php" );
            $result = $db->getCreator($id);
            if ( mysql_numrows($result) > 0 ) {
                $creatorname = mysql_result( $result, 0, "name" );
                $creatorrole = mysql_result( $result, 0, "role" );
                createsession( $id, $creatorname, $creatorrole );
                header( 'Location: index.html' ) ;
			    exit();
            } else {
                throw new Exception( "We can't find your account" );
            }
        } catch( Exception $e ) {
            $message = $e->getMessage();
            $page = "<html>";
            $page .= "<head>";
            $page .= "<title>Playsouthend</title>";
            $page .= "<link href='css/default.css' rel='stylesheet' />";
            $page .= "</head>";
            $page .= "<body>";
            $page .= "<img style='margin: 16px' src='images/lplogo.png' /><br />";
            $page .= "Unable to verify your registration because:<p/><b>'$message'</b><p/>Please try again later or join again<p/>Meanwhile you can continue to play <a href='index.html'>here</a>";
            $page .= "</body>";
            $page .= "</html>";
            echo $page;
        }
    } else {
        echo '{ "status" : "FAILED", "message" : "Invalid method" }';
    }
?>
