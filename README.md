A general quiz taking app

be able to deploy your quiz with one command
izzyquizz initialize --rounds=<number_of_rounds> --questions=<path_to_questions_file>

The app then should run on port:8080 by default unless you overrides this with --port=<port_number>

The app then splits the questions into equal intervals corresponding to the number of rounds. 
Note that the number of rounds should be at least 1 




