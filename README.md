## Play Your Place 

### What is Play Your Place? 

Play Your Place is planned as a series of campaigns for people to shape their own towns through play, for the health and prosperity of all. It combines public events and a free, online and mobile game building game through which people create a multi-level platform game together about the future of their town.

The Play Your Place software is an online platform for anyone to draw, make and play their future town. Created by artists Ruth Catlow (UK) and Mary Flanagan(US) of Local Play, [Play Southend](http://playsouthend.co.uk/) was the first in a series of game platforms that enable people to draw a place in their area, think about how it could be changed for the better and devise their own rules, drawing obstacles and rewards; building and sharing game levels. Each game can also be used as the base for someone else to create their own game.

[More](http://localplay.org.uk/about/)

### What's in this code?

This is the base code and database needed to build a Play Your Place platform including some base assets and a single admin user. For an example of what this code base create visit the first instantiation of Play Your Place; [Play Southend](http://playsouthend.co.uk/).


## Getting Started

### Getting the code

Either clone the project

	git clone https://github.com/LocalPlay/PlayYourPlace.git

or download the zipped archive
	
    https://github.com/LocalPlay/PlayYourPlace/archive/master.zip

### Server requirements

To serve these files you can use Apache or similar HTTP server providing it has PHP and MySQL installed. Also you will need the [Apache Module mod_rewrite](http://httpd.apache.org/docs/current/mod/mod_rewrite.html) installed and enabled or something that emulates its behaviour if you are using a different HTTP server. 

The site has been developed on PHP v5.4.3 and MySQL v5.5.24. Despite this the code and database may work on earlier versions but to be sure we recommend this as a minimum.

### Create database

Inside the database directory you will find a database export of a clean Play Your Place platform. Providing you have access to mysql on the command line you can navigate to the database directory on the command line and type the following:

	mysql -u root -p < playyourplace.sql

This also assumes you have root access. If you have access to a MySQL web interface (e.g. phpmyadmin) then you can import that sql file using this. 

This will create a table called 'playyourplace' with a single admin user
( username 'admin@playsouthend.co.uk' password 'playlocal' ).

(Optional) You can also create a new MySQL user and grant this user access to this table. If not and you are happy to use root username and password then do so. 

After logging into MySQL on the command line:

	mysql> CREATE USER 'playyourplace'@'localhost' IDENTIFIED BY 'PlayYourPlace101'

followed by:

	mysql> grant CREATE,INSERT,DELETE,UPDATE,SELECT on playyourplace.* to playyourplace@localhost;
    
### Serve files

If you are using Apache then point your DocumentRoot to the htdocs directory: (The line below assumes you have copied the PlayYourPlace directory into /var/www)

	DocumentRoot /var/www/PlayYourPlace/htdocs


### Configuration

Finally you need to update the host, username, password and database in the db.php file in the htdocs directory.

	$this->db = mysql_pconnect( "localhost", "playyourplace", "PlayYourPlace101" );
    $this->dieIfNotConnected();
    mysql_select_db( "playyourplace", $this->db );

### Credits & Attribution 

The following libraries are used on the front end of the application.

* FileToDataURI Library (Aymkdn) - https://github.com/Aymkdn/FileToDataURI
* Box2d Physics (Erin Catto) - http://box2d.org/
* MD5 - http://www.webtoolkit.info/javascript-md5.html

Credit is due to the authors and contributors for making their work available for use here.
Play Your Place is a Local Play project, instigated and designed by Ruth Catlow and Dr Mary Flanagan. Technical development by Soda 
