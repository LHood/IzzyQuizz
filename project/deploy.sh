#!/bin/bash

#Initialize color variables
RED='\e[0;31m'
GREEN='\e[0;32m'
NC='\e[0m' #No color
PURPLE='\e[0;35'

printf 'Runing the tests to make sure that they all pass \n'
python *test*.py

exitCode=$?

if [ $exitCode -eq 0 ]
then
	printf '\e[0;32m All tests  pass! \e[0m Proceeding to next steps\n'
	#Deploy the project
else
	printf ' \e[0;31m Some tests are failing. There may be errors in performance of the project \n'
	printf '\e[0m To stop the deployment process, press ctrl+c \n'
	printf 'Otherwise, the deployment process will continue to next steps \n'
fi

