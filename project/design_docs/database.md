# The main components of the database are the following:

## Users

=======================================
Id | First Name | Last Name | Email

========================================
## Questions

======================================
Id | Title | Right Answer | Options[ we add the ones which are not the right answer. 
the right answer will be randomly placed among the extra options added.
======================================

## rounds

==========================================================================
number | title <optional> | questions [Array of Quesiton Id's] | Duration
===========================================================================

## Results

======================================
Round | User Id | Points

#### Notice:
We are going to need a way to structure our data, and a way to access our date. 
#### Things to think about:
-> What's the best database to use?
-> What way can we use to capture's user's information?
-> In what way can we initialize control of what's happening

