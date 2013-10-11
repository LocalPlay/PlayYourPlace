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
	// process form
	//
	if ($_POST) {
	try {
            //
            // connect to database
            //
            require_once( "db.php" );
            $db = new DBConnection;
            $db->connect();
            //
            // validate user
            //
            $email = $_POST[ 'email' ];
            $password = $_POST[ 'password' ];
            $id = $db->validateCreator( $email, $password );
            //
            //
            //
            if ( $id != 0 ) {
                //
                // initialise session
                //
                require_once( "session.php" );
                $result = $db->getCreator($id);
                if ( mysql_numrows($result) > 0 ) {
                    $blocked = mysql_result( $result, 0, "blocked" );
                    $verified = mysql_result( $result, 0, "verified" );
                    if ( $blocked ) {
                        echo '{ "status" : "FAILED", "message" : "Your account has been suspended!" }'; 
                    } else if ( $verified != 1 ) {
                        echo '{ "status" : "FAILED", "message" : "You must verify your email address.<br />Please check your inbox for the verification email and follow the link" }';
                    } else {
                        $creatorname = mysql_result( $result, 0, "name" );
                        $creatorrole = mysql_result( $result, 0, "role" );
                        createsession( $id, $creatorname, $creatorrole );
                        //
                        // 
                        //
                        $response = array( "status" => "OK", "message" => "logged in as $creatorname", "creatorid" => "$id", "creatorname" => "$creatorname", "creatorrole" => "$creatorrole" ); 
                        echo json_encode($response);
                   }
                } else {

                }
            } else {
                echo '{ "status" : "FAILED", "message" : "Invalid email or password" }';
            }
        } catch( Exception $e ) {
            echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
        }
    } else {
  	    echo '{ "status" : "FAILED", "message" : "Invalid method" }';
    }

?>