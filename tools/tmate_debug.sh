#!/bin/sh


#
# This script will install tmate and launch a remotely accessible SSH session on a machine
# THIS IS DANGEROUS ON A PUBLIC MACHINE.
#
sudo apt-get update
sudo apt-get install -y tmate openssh-client
echo -e 'y\n'|ssh-keygen -q -t rsa -N "" -f ~/.ssh/id_rsa
tmate -S /tmp/tmate.sock new-session -d
tmate -S /tmp/tmate.sock wait tmate-ready
tmate -S /tmp/tmate.sock display -p '#{tmate_ssh}'
tmate -S /tmp/tmate.sock display -p '#{tmate_web}'