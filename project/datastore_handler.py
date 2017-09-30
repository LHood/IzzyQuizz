from google.cloud import datastore
import time

datastore_client = datastore.Client()

def save_user(userId, userName):
	kind = 'user'
	name = str(int(round(time.time() * 1000)))
	task_key = datastore_client.key(str(userId), userName)
	task = datastore.Entity(key=task_key)
	task['id'] = userId
	task['name'] = userName
	datastore_client.put(task)
	print('Saved {}:{}'.format(task.key.name, task['id']))
users = [(1, 'Nakeshimana'), (2, 'Audace')]
for user in users:
	save_user(user[0], user[1])

def list_users():
	query = datastore_client.query()
	results = list(query.fetch())
	for result in results:
		print('result: ', result)
	return results

list_users()