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

printf ' \e[0;35m === RUNNING TESTS TO MAKE SURE THAT THEY ALL PASS === \e[0m \n'
python *test*.py

exitCode=$?

if [ $exitCode -eq 0 ]
then
	printf '\e[0;32m PASSED: All tests  pass! \e[0m Proceeding to next steps\n'
	#Deploy the project
else
	printf ' \e[0;31m Some tests are failing. There may be errors in performance of the project \n'
	printf '\e[0m To stop the deployment process, press ctrl+c \n'
	printf 'Otherwise, the deployment process will continue to next steps \n'
fi

#CHECK FOR VIRTUALENV INSTALLATION
#IF NOT, USE PIP TO INSTALL VIRTUALENV
#EXIT IF WE FAILT TO INSTALL VIRTUALENV

printf 'Checking virtualenv installation \n'

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

