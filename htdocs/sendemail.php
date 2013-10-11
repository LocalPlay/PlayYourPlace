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
        echo '{ "status" : "FAILED", "message" : "You do not have permission to send email!" }';
        exit();
    }
    //
    //
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
            // get data 
            //
            $subject	= $_POST[ 'subject' ];
            $email	    = $_POST[ 'email' ];
            $message    = $_POST[ 'message' ];
            //
            // send mail
            //
            $name = "Playsouthend"; 
            $sender = "admin@playsouthend.co.uk"; 
            //
            // 
            //
            $header  = "From: $name <$sender>\r\n"; 
            $header .= "Reply-To: $sender\r\n"; 
            $header .= "Return-path: $sender\r\n" .
            mail($email, $subject, $message, $header, "-f$sender");
            //
            //
            //
            echo '{ "status" : "OK", "message" : "Message sent" }';
        } catch( Exception $e ) {
          echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
        }
      } else {
        echo '{ "status" : "FAILED", "message" : "Invalid method" }';
      }
?>
