<?PHP
/*
	Place  _next_to_ (NOT _into_) htdocs!
	It contains passwords and such files should never be in htdocs.
	If your database is not called "tictac",
	the user name for the database is not tictac and/or
	the user password is not the random but of text below...
	...then you will want to change your versions of those here!-)
*/

function getDbStringFromCredentials()
{
    return "mysql:host=localhost;port=13306;dbname=tictac";
}


function getDbUserFromCredentials()
{
	return "tictac";
}

function getDbPwdFromCredentials()
{
	return "password123";
}

?>