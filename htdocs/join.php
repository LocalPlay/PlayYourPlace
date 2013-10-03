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
        // add user
        //
	    $creatorname = addslashes($_POST[ 'creatorname' ]);
	    $email = $_POST[ 'email' ];
	    $password = $_POST[ 'password' ];
        if ( strlen( $creatorname ) < 1 ) {
            echo '{ "status" : "FAILED", "message" : "Invalid name" }';
        } else if ( $db->emailExists( $email ) ) {
  	        echo '{ "status" : "FAILED", "message" : "Email address already registered" }';
        } else if ( $db->creatorExists( $creatorname ) ) {
  	        echo '{ "status" : "FAILED", "message" : "Name taken" }';
        } else {
          $id = $db->createaccount( $creatorname, $email, $password );
          if ( $id ) {
            sendverification($email,$id);
            $response = array( "status" => "OK", "message" => "You have joined as '$creatorname'.<br />A confirmation has been sent to $email.<br />Please check your email and follow the instructions<br />to complete your registration.", "creatorid" => "$id", "creatorname" => "$creatorname", "creatorrole" => "0" ); 
            echo json_encode($response);
          } else {
  	        echo '{ "status" : "FAILED", "message" : "Unable to create account" }';
          }
        }
    } catch( Exception $e ) {
  	    echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
    }
} else {
  	echo '{ "status" : "FAILED", "message" : "Invalid method" }';
}

function sendverification( $email, $id ) {
        $link = "http://playsouthend.co.uk/verifycreator.php?id=$id";
$message = "Thank you for registering with Play Your Place\r\n
To validate and complete registration, please click the link below\r\n
$link\r\n
You may have some questions about what happens to your images and game levels.\n
For full details please look at our FAQs http://localplay.org.uk/faq\r\n
Summary of terms and conditions\r\n
By uploading a drawing to a Play Your Place game you agree to\n
grant permission to other people to use it in their game levels\n
and for its use in all Play Your Place games and promotions\n
in perpetuity.\r\n
While the games you create remain online they will always be\n
free to play.\r\n
People can also use your game levels to make derivative works\n
as long as full accreditation is given and it is distributed\n
under the same terms using Creative Commons Attribution-Shared\n
Alike license http://creativecommons.org/licenses/by-sa/3.0/ applies.\r\n
Please do not to upload drawings that may be considered hateful,\n
obscene or to which you do not own the copyright. We may be\n
called upon to remove it from the database at a later date which\n
could ruin yours and others games. While we make all efforts to\n
ensure that the game remains a site for positive interaction we are\n
not responsible for offensive or problematic content posted by\n
the public.\r\n
We can't wait to play your new game levels about your place!\r\n
The Play Your Place team\r\n";

        $name = "Playsouthend"; //senders name 
        $sender = "admin@playsouthend.co.uk"; //senders e-mail adress 
        //
        // 
        //
        $subject = "Playsouthend login"; //subject 
        $header = "From: ". $name . " <" . $sender . ">\r\n"; //optional headerfields 
        try {
            mail($email, $subject, $message, $header, "-f$sender");
        } catch ( Exception $e ) {
        }
}
?>