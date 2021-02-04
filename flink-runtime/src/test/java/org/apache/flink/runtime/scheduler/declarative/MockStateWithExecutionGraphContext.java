/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.apache.flink.runtime.scheduler.declarative;

import org.apache.flink.runtime.executiongraph.ArchivedExecutionGraph;

import java.util.concurrent.Executor;
import java.util.concurrent.ForkJoinPool;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;

class MockStateWithExecutionGraphContext implements StateWithExecutionGraph.Context, AutoCloseable {

    private final StateValidator<ArchivedExecutionGraph> finishedStateValidator =
            new StateValidator<>("finished");

    Function<State, Boolean> expectedStateChecker =
            (ign) -> {
                throw new UnsupportedOperationException("Remember to set me");
            };

    private Supplier<Executor> getMainThreadExecutor = ForkJoinPool::commonPool;

    public void setGetMainThreadExecutor(Supplier<Executor> supplier) {
        this.getMainThreadExecutor = supplier;
    }

    public void setExpectedStateChecker(Function<State, Boolean> function) {
        this.expectedStateChecker = function;
    }

    public void setExpectFinished(Consumer<ArchivedExecutionGraph> asserter) {
        finishedStateValidator.activate(asserter);
    }

    @Override
    public void runIfState(State expectedState, Runnable action) {
        if (expectedStateChecker.apply(expectedState)) {
            action.run();
        }
    }

    @Override
    public boolean isState(State expectedState) {
        throw new UnsupportedOperationException("Not covered by this test at the moment");
    }

    @Override
    public void goToFinished(ArchivedExecutionGraph archivedExecutionGraph) {
        finishedStateValidator.validateInput(archivedExecutionGraph);
    }

    @Override
    public Executor getMainThreadExecutor() {
        return getMainThreadExecutor.get();
    }

    @Override
    public void close() throws Exception {
        finishedStateValidator.close();
    }
}
