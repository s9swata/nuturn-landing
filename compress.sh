#!/bin/bash
count=0
for file in ../ezgif-66f073bf380b7f37-png-split/*.png; do
  idx=$(printf "%03d" $count)
  cwebp -q 80 "$file" -o "public/frames/frame-$idx.webp" > /dev/null 2>&1 &
  count=$((count+1))
  
  if [ $((count % 8)) -eq 0 ]; then
    wait
  fi
done
wait
echo "Done"
