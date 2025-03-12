#!/bin/bash

echo "**** Deployment Started ****"

cloning_code(){
	echo "Cloning Code from Github"
	git clone https://github.com/Harshit-Patel01/MRv.git
	cd MRv
	ls
}
install_Requirement(){
	echo "Installing Requirements"
	sudo apt install npm
}
deploy(){
	sudo docker compose up
}
if !(cloning_code) ; then
	echo "Changing Working Dir to MRv as Code already exists"
	cd MRv
fi
if !(install_Requirement); then
	echo "Installing Requirments Failed"
	exit 1
if !(deploy); then
	echo "*** Deployment Failed ***"
	exit 1
