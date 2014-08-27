/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.apache.flink.fs.tachyon;

import java.io.IOException;

import org.apache.flink.core.fs.BlockLocation;

/**
 * Implementation of the {@link BlockLocation} interface for the Tachyon File System.
 */
public class TachyonBlockLocation implements BlockLocation {
    private final String[] hosts;
    private final long offset;
    private final long length;

    public TachyonBlockLocation(String[] hosts, long offset, long length) {
        this.hosts = hosts;
        this.offset = offset;
        this.length = length;
    }

    @Override
    public String[] getHosts() throws IOException {
        return hosts;
    }

    @Override
    public long getOffset() {
        return offset;
    }

    @Override
    public long getLength() {
        return length;
    }

    /**
     * Compares two BlockLocations based on their offset.
     */
    @Override
    public int compareTo(BlockLocation o) {
        return ((Long) (offset)).compareTo(o.getOffset());
    }
}
