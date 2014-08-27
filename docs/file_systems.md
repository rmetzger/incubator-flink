---
title: "File Systems"
---

Flink has build-in support for the following file systems:

| Filesystem        | Since           | Scheme  | Notes |
| ------------- |-------------| -----| ------ |
| Hadoop Distributed File System (HDFS)  | 0.2 | `hdfs://`| All HDFS versions are supported |
| MapR file system      | 0.7-incubating      |  `maprfs://` | The user has to manually place the required jar files in the `lib/' dir |
| Tachyon   |    0.7-incubating | `tachyon://` |  |
| Amazon S3 |  0.2 | `s3://` |  |


