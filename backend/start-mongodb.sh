#!/bin/bash
echo "Starting MongoDB..."

# পুরানো প্রসেস কিল
pkill mongod 2>/dev/null

# MongoDB চালু
mongod --dbpath=$PREFIX/var/lib/mongodb \
       --logpath=$PREFIX/var/log/mongodb/mongod.log \
       --bind_ip=127.0.0.1 \
       --port=27017 \
       --fork

# স্ট্যাটাস চেক
sleep 2
if pgrep -x mongod > /dev/null; then
    echo "✅ MongoDB started successfully"
    echo "📡 MongoDB running on port 27017"
else
    echo "❌ MongoDB failed to start"
    cat $PREFIX/var/log/mongodb/mongod.log
fi
