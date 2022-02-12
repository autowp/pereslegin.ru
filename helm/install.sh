#!/bin/bash

set -e

helm -n pereslegin upgrade --install --create-namespace pereslegin .