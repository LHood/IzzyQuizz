from google.cloud import datastore
import time

datastore_client = datastore.Client()


def save_user(userId, userName):
    kind = 'user'
    task_key = datastore_client.key(kind, userId)
    task = datastore.Entity(key=task_key)
    task['id'] = userId
    task['name'] = userName
    datastore_client.put(task)
    print('Saved {}:{}'.format(task.key.kind, task.key.id))


def list_users():
    query = datastore_client.query(kind='user')
    results = list(query.fetch())
    for result in results:
        name, userId = 'user', result['id']
        task_key = datastore_client.key(name, str(userId))
        print('listed: ', task_key)
    response = [[result['id'], result['name']] for result in results]
    print(response)
    return response


list_users()


def delete_users():
    query = datastore_client.query(kind='user')
    results = list(query.fetch())
    for result in results:
        name, userId = 'user', result['id']
        task_key = datastore_client.key(name, str(userId))
        datastore.delete(task_key)
        print('deleted: ', task_key)
    results_ = list(query.fetch())
    assert(results != results_)
    print('after deletion: ', results)
    return results


delete_users()
