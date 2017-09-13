#!/bin/bash

#Initialize color variables
RED='\e[0;31m'
GREEN='\e[0;32m'
NC='\e[0m' #No color
PURPLE='\e[0;35'
# ================================== Here is how things should happen ==================
# Install Pip
# Install Virtualenv
#Create the environment
#Activate the environment
#Install flask in the environment
#Then run unittests
#If they pass, then deploy the flask server
#In addition, we should not just prompt to overwrrite the current flask directory, but 
# We can keep iterating until we find a valid name for the env that we are going to create.
#Also, that way it could be easy for us to know how many envs we have, and which ones we have
# Active and which ones that we don't
#TODO(heyaudace): Rearrange the code to procceed through these steps
#=======================================================================================



#CHECK FOR PIP INSTALLATION
#INSTALL PIP IF IT IS NOT THERE AND EITHER BREW OR APT-GET IS PRESENT
#KEEP GOING IF PIP IS PRESENT, STOP IF WE CAN'T INSTALL PIP WITH BREW OR APG-GET

printf '\e[0;35m == CHECKING PIP INSTALLATION === \e[0m \n'

if ! hash pip 2>/dev/null;then
	printf '\e[0;35m Pip not installed. Installing pip before proceeding \e[0m \n'
	if  hash brew 2>/dev/null;then
		printf '\e[0;32m Found brew. Using brew to install pip \e[0m \n'
		sudo brew update
		sudo brew install python-pip
	else
		if hash apt-get 2>/dev/null;then
			printf '\e[0;35m found apt-get. Using apt-get to install pip \e[0m \n'
			sudo apt-get update
			sudo apt-get install python-pip
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
	printf ' \e[0;31m Some tests are failing. Please make sure that your code passes before proceeding! \n Going to exit \e[0m \n'
	exit
fi

# VIRTUALENV NOT NECESSARY RIGHT NOW, SO I WILL COMMENT IT OUT
: << 'END'

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
create_env=false
if [  -d "env" ]
then
	printf '\e[0;35m Directory with name "env" alread exists. Overwrite? \e[0m \n'
	select yn in "Yes" "No"; do
		case $yn in
			Yes ) sudo rm -r env; printf '\e[0;35m Overwritten the old directory.\e[0m \n'; create_env=true; break;;
			No ) printf 'Keeping the old directory. Assuming the virtual environment is already installed \n'; break;;
		esac
	done
else
	echo "env does not exist"
fi
if [ create_env ]
then
	sudo virtualenv env
else
	printf 'Using the preexisting environment'
fi
exitCode=$?
if [ ! $exitCode -eq 0 ]
then
	printf '\e[0;31m ERROR: A virtual environment cannot be created. Please try doing it manually \e[0m \n Exiting \n'
else
	printf '\e[0;32m SUCCESS: Virtual environment created successfully \e[0m \n'
fi
END
#Launch the server now
export FLASK_APP=server.py
python server.py
