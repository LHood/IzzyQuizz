#!/bin/bash

#Initialize color variables
RED='\e[0;31m'
GREEN='\e[0;32m'
NC='\e[0m' #No color
PURPLE='\e[0;35'


#CHECK FOR PIP INSTALLATION
#INSTALL PIP IF IT IS NOT THERE AND EITHER BREW OR APT-GET IS PRESENT
#KEEP GOING IF PIP IS PRESENT, STOP IF WE CAN'T INSTALL PIP WITH BREW OR APG-GET

printf '\e[0;35m == CHECKING PIP INSTALLATION === \e[0m \n'

if ! hash pip 2>/dev/null;then
	printf '\e[0;35m Pip not installed. Installing pip before proceeding \e[0m \n'
	if  hash brew 2>/dev/null;then
		printf '\e[0;32m Found brew. Using brew to install pip \e[0m \n'
		sudo brew install pip
	else
		if hash apt-get 2>/dev/null;then
			printf '\e[0;35m found apt-get. Using apt-get to install pip \e[0m \n'
			sudo apt-get install pip
		else
			printf '\e[0;31m Cannot find brew or apt-get. Please install brew or apt-get before proceeding \e[0m \n'
		fi
	fi
else
	printf '\e[0;32m PASS: Pip is installed. Proceeding to next steps ... \e[0m \n'
fi
exitCode=$?
if [ ! $exitCode -eq 0 ]
then
	printf '\e[0;31m There was an errow while installing pip. please install it manually and try again \e[0m \n Exiting \n'
	exit
fi


#CHECK FOR FLASK INSTALLATION
#INSTALL FLASK USING PIP IF IT'S NOT THERE
#EXIT IF THE FLASK INSTALLATION FAILS
printf '\e[0;35m === CHECKING FLASK INSTALLATION ===\e[0m \n'

if hash flask 2>/dev/null;then
	printf '\e[0;32m PASS: Flask is installed. Proceeding to the next steps ... \e[0m \n'
else
	printf '\e[0;35m WARNING: Flask is not installed. Attempting to install flask \e[0m \n'
	sudo pip install flask
	if hash flask 2>/dev/null;then
		printf '\e[0;32 PASS: Installed flask successfully. Proceeding to next steps ... \e[0m \n'
	fi

fi

exitCode=$?
if [ ! $exitCode -eq 0 ]
then
	printf '\e[0;31m There was an error while installing flask. Please install it manually and try again. \e[0m \n Exiting \n'
	exit
fi

#RUN UNIT AND END2END TESTS TO ENSURE THAT THE APP WILL BEHAVE AS EXPECTED
#GIVE A WARNING IF THE TESTS DON'T PASS, BUT PROCEED
#THE USER CAN DECIDE TO QUIT THE EXECUTION BY PRESSING CTRL + C

printf ' \e[0;35m === RUNNING TESTS TO MAKE SURE THAT THEY ALL PASS === \e[0m \n'
python *test*.py

exitCode=$?

if [ $exitCode -eq 0 ]
then
	printf '\e[0;32m PASS: Hoorray!! All tests  pass! Proceeding to next steps... \e[0m \n'
else
	printf ' \e[0;31m Some tests are failing. There may be errors in performance of the project \n'
	printf '\e[0m To stop the deployment process, press ctrl+c \n'
	printf 'Otherwise, the deployment process will continue to next steps \n'
fi

#CHECK FOR VIRTUALENV INSTALLATION
#IF NOT, USE PIP TO INSTALL VIRTUALENV
#EXIT IF WE FAILT TO INSTALL VIRTUALENV

printf ' \e[0;35m === CHECKING VIRTUALENV INSTALLATION === \e[0m \n'

if ! hash virtualenv 2>/dev/null;then
	printf '\e[0;35m Virtualenv not installed. Installing virtualenv before proceeding \e[0m \n'
	sudo pip install virtualenv
else
	printf '\e[0;32m PASS: Virtualenv is already  installed. proceeding to next steps \e[0m \n'
fi
exitCode=$?
if [ ! $exitCode -eq 0 ]
then
	printf '\e[0;31m EERROR: Cant install virtualenv. Please install  it manually and try again \e[0m \n Exiting \n'
	exit
fi

#CREATE A VIRTUAL ENVIRONMENT
#THEN ACTIVATE THE ENVIRONMENT
printf '\e[0:35m === CREATING A VIRTUAL ENVIRONMENT ==== \e[0m \n'
create_env=true
if [  -d "env" ]
then
	printf '\e[0;35m Directory with name "env" alread exists. Overwrite? \e[0m \n'
	select yn in "Yes" "No"; do
		case $yn in
			Yes ) sudo rm -r env; printf '\e[0;35m Overwritten the old directory.\e[0m \n'; break;;
			No ) create_env=false; printf 'Keeping the old directory. Assuming the virtual environment is already installed'; break;;
		esac
	done
else
	echo "done"
fi
if [ create_env ]
then
	sudo virtualenv env
fi
exitCode=$?
if [ ! $exitCode -eq 0 ]
then
	printf '\e[0;31m ERROR: A virtual environment cannot be created. Ply try doing it manually \e[0m \n Exiting \n'
	exit
fi

