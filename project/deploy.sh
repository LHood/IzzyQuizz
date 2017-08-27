#!/bin/bash


echo "Runing the tests to make sure that they all pass"
python *test*.py

exitCode=$?

if [ $exitCode -eq 0 ]
then
	echo "All tests have passed! Proceeding to next steps"
	#Deploy the project
else
	echo "Some tests are failing. There may be errors in performance of the project "
	echo "To stop the deployment process, press ctrl+c"
	echo "Otherwise, the deployment process will continue to next steps"
fi

