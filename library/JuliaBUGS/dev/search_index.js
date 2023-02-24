var documenterSearchIndex = {"docs":
[{"location":"compilation_target/#Compilation-Targets","page":"Compilation Target","title":"Compilation Targets","text":"","category":"section"},{"location":"compilation_target/#DAG","page":"Compilation Target","title":"DAG","text":"","category":"section"},{"location":"compilation_target/","page":"Compilation Target","title":"Compilation Target","text":"Directed Acyclic Graph (DAG) is classical representation of probabilistic models. ","category":"page"},{"location":"compilation_target/#Node-Data","page":"Compilation Target","title":"Node Data","text":"","category":"section"},{"location":"compilation_target/","page":"Compilation Target","title":"Compilation Target","text":"SymbolicPPL.VertexInfo","category":"page"},{"location":"compilation_target/","page":"Compilation Target","title":"Compilation Target","text":"Vertex store the following information:","category":"page"},{"location":"compilation_target/","page":"Compilation Target","title":"Compilation Target","text":"the name of the variable\nthe parents of the variable\nthe node function (see Node Function))\nwhether the variable is data or not","category":"page"},{"location":"compilation_target/#Node-Function","page":"Compilation Target","title":"Node Function","text":"","category":"section"},{"location":"compilation_target/","page":"Compilation Target","title":"Compilation Target","text":"The node function is a very flexible representation.  The requirement for a node function is that when evaluate with the input arguments, it returns a Distribution object. This may seems simple, but it can be very powerful. For instance, a mixture model can be represented by a node function similar to","category":"page"},{"location":"compilation_target/","page":"Compilation Target","title":"Compilation Target","text":"function node_f(t, μ_1, μ_2, σ_1, σ_2)\n    if t >= 4\n        return Normal(μ_1, σ_1)\n    else\n        return Normal(μ_2, σ_2)\n    end\nend","category":"page"},{"location":"compilation_target/#Plotting","page":"Compilation Target","title":"Plotting","text":"","category":"section"},{"location":"compilation_target/","page":"Compilation Target","title":"Compilation Target","text":"A good way to debug a model is plotting the Bayesian Network.  We recommend using the TikzGraphs package to plot the Bayesian Network.  The following code shows how to plot the Bayesian Network of the model in the previous section.  Please note that the following code requires local latex environment to work.  For more information regarding installation and more advanced usage of TikzGraphs, please refer to the TikzGraphs.jl.","category":"page"},{"location":"compilation_target/","page":"Compilation Target","title":"Compilation Target","text":"using SymbolicPPL\nusing Graphs, MetaGraphsNext\n\n# Compile model\nexpr = @bugsast begin\n    a ~ dnorm(0, 1)\n    b ~ dnorm(a, 1)\n    c ~ dnorm(a, b)\n    d ~ dnorm(a - b, c)\nend\n\ng = compile(expr, NamedTuple(), :Graph)\ng[:d]\n\n# Plot with TikzGraphs\nusing TikzGraphs, TikzPictures\nimport TikzGraphs: plot\n\nfunction plot(g)\n    color_dict = Dict{Int, String}()\n    for (i, node) in enumerate(vertices(g))\n        if g[label_for(g, node)].is_data\n            color_dict[i] = \"fill=green!10\"\n        else\n            color_dict[i] = \"fill=yellow!10\"\n        end\n    end\n\n    TikzGraphs.plot(\n        g.graph, \n        map(x->string(label_for(g, x)), vertices(g)), \n        node_style=\"draw, rounded corners, fill=blue!10\", \n        node_styles=color_dict,\n        edge_style=\"black\"\n    )\nend","category":"page"},{"location":"compilation_target/","page":"Compilation Target","title":"Compilation Target","text":"Also plotting with GraphRecipes.jl is also possible, but not recommended.","category":"page"},{"location":"compilation_target/","page":"Compilation Target","title":"Compilation Target","text":"# Plot with GraphRecipes\n# The plot may not\nusing Plots, GraphRecipes\ngraphplot(\n    g.graph,\n    names = map(x->label_for(g, x), vertices(g)),\n    curves = false,\n    method = :tree\n)","category":"page"},{"location":"compilation_target/#Turing-Model","page":"Compilation Target","title":"Turing Model","text":"","category":"section"},{"location":"compilation_target/#More-to-come","page":"Compilation Target","title":"More to come","text":"","category":"section"},{"location":"api/#API","page":"API","title":"API","text":"","category":"section"},{"location":"api/#Compile","page":"API","title":"Compile","text":"","category":"section"},{"location":"api/","page":"API","title":"API","text":"compile","category":"page"},{"location":"ast/#Syntax-and-model-representation","page":"AST Translation","title":"Syntax & model representation","text":"","category":"section"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"We provide some convenience functions to work with graphical models syntactically in Julia, inspired very much by BUGS. BUGS (Bayesian inference Using Gibbs Sampling), as the name says, is a probabilistic programming system originally designed for Gibbs sampling. For this purpose, BUGS models define, implicitly, only a directed graph of variables, not an ordered sequence of statements like other PPLs. They do have the advantage of being relatively restricted (while still able to express a very large class of practically used models), and hence allowing lots of static analysis.   Specifically, stochastic control flow is disallowed (except for the “mixture model” case of indexing by a stochastic variable, indexing with stochastic variable is not supported yet).","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"We provide a macro solution which allows to directly use Julia code corresponding to BUGS code:","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"@bugsast begin\n    for i in 1:N\n        Y[i] ~ dnorm(μ[i], τ)\n        μ[i] = α + β * (x[i] - x̄)\n    end\n    τ ~ dgamma(0.001, 0.001)\n    σ = 1 / sqrt(τ)\n    logτ = log(τ)\n    α = dnorm(0.0, 1e-6)\n    β = dnorm(0.0, 1e-6)\nend","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"BUGS syntax carries over almost one-to-one to Julia. The macro checks that only allowed syntactic forms are used and then applies some minor normalizations. The most prominent normalization is the conversion of stochastic statements (tildes) from :call expressions to first-class forms:","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"quote\n    for i = 1:N\n        $(Expr(:~, :(Y[i]), :(dnorm(μ[i], τ))))\n        μ[i] = α + β * (x[i] - x̄)\n    end\n    $(Expr(:~, :τ, :(dgamma(0.001, 0.001))))\n    σ = 1 / sqrt(τ)\n    logτ = log(τ)\n    α = dnorm(0.0, 1.0e-6)\n    β = dnorm(0.0, 1.0e-6)\nend","category":"page"},{"location":"ast/#Add-New-Functions-–-this-should-be-replaced-by-the-@bugsfunction-macro","page":"AST Translation","title":"Add New Functions – this should be replaced by the @bugsfunction macro","text":"","category":"section"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"It should be reasonably easy to define anything else on top of this representation by using simple if statements, and Meta.isexpr. Interpolation ($(…)) is allowed in @bugsast; the result of the macro is a :quote expression, in which the interpolations are just left as is. I.e.,","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"@bugsast begin\n    x = $(myfunc(somevalue))\nend","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"will end up as ","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"quote\n    x = $(myfunc(somevalue))\nend","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"with quasi-quotation working as usual. (Using interpolation, it is possible to construct ASTs which bypass validation and do not correspond to valid BUGS programs – use it with care.)","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"In addition, there is a string macro bugsmodel which should work with original (R-like) BUGS syntax:","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"bugsmodel\"\"\"\n    for (i in 1:5) {\n        y[i] ~ dnorm(mu[i], tau)\n        mu[i] <- alpha + beta*(x[i] - mean(x[]))\n    }\n    \n    alpha ~ dflat()\n    beta ~ dflat()\n    tau <- 1/sigma2\n    log(sigma2) <- 2*log.sigma\n    log.sigma ~ dflat()\n\"\"\"","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"Internally, the only thing this does is apply a couple of regex-based substitutions to convert the code to the equivalent Julia, Meta.parse the result, and apply the same logic as @bugsast. We encourage users to write new program using the Julia-native syntax, because of better debuggability and perks like syntax highlighting.  But in the case of testing out legacy program, the macro upfront should work for copy-paste situations. All variable names are preventively wrapped in var-strings; this allows R-style names like b.abd.","category":"page"},{"location":"ast/#AST-structure","page":"AST Translation","title":"AST structure","text":"","category":"section"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"Basically, all forms which obviously translate from BUGS to Julia are preserved in the equivalent Julia Exprs (:call, :for, :if, :=, :ref). The resulting code should be as close to executable as possible. Special forms are converted, though, in order to simplify pattern matching:","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"~ statements are parsed as :call by Julia, and get their own form (dc[i] ~ dunif(0, 20) → (:~, (:ref, :dc, :i), (:call, :dunif, 0, 20))).\nIn logical assignments with link functions, the block on the right hand side, automatically created by the Julia parser, is removed. The result is therefore an := expression with a direct :call on the LHS.\nCensoring and truncation annoations are converted to :censored and :truncated forms (dnorm(x, μ) C (, 10) → (:censored, (:call, :dnorm, :x, :μ), :nothing, 100)). The left-out limits (C (, 100)) are filled with nothing. In @bugsast, you may just use normal calls truncated(dist, l, r) and censored(dist, l, r), which will be raised to special forms automatically.\nEmpty ranges are automatically filled with slices (x[,] → (:ref, :x, :(:), :(:))).","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"In addition, forms that have both a :call representation and their own lowered form are tried to be normalized to the latter; currently, this concerns getindex to :ref, and : to :(:).  LineNumberNodes are stripped completely.","category":"page"},{"location":"ast/#Semantics","page":"AST Translation","title":"Semantics","text":"","category":"section"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"The semantics of BUGS are not really made explicit.  I have tried to \"reconstruct\" a formalization and type system, but this is still ongoing work.","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"BUGS programs, in contrast to some other PPLs, have the sole purpose of implicitly describing a directed graphical model. This means that they don’t really have operational semantics – there are not declarations of variables, input, outputs, etc., nor is order relevant. A program like","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"model\n{\n  for( i in 1 : N ) {\n    for( j in 1 : T ) {\n      Y[i , j] ~ dnorm(mu[i , j], tau.c)\n      mu[i , j] <- alpha[i] + beta[i] * (x[j] - xbar)\n    }\n    alpha[i] ~ dnorm(alpha.c, alpha.tau)\n    beta[i] ~ dnorm(beta.c, beta.tau)\n  }\n  tau.c ~ dgamma(0.001, 0.001)\n  sigma <- 1 / sqrt(tau.c)\n  alpha.c ~ dnorm(0.0, 1.0E-6)\n  alpha.tau ~ dgamma(0.001, 0.001)\n  beta.c ~ dnorm(0.0, 1.0E-6)\n  beta.tau ~ dgamma(0.001, 0.001)\n  alpha0 <- alpha.c - xbar * beta.c\n}","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"denotes only a certain relationship between (logical or stochastic) nodes in a graph. Variables are either names of nodes within the program (when on the LHS of a sampling or assignement statement, like alpha or sigma), or otherwise constant parts of the “data” (like N and xbar), with which a model must be combined to instantiate it.","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"Loops are just a form of “plate notation”: they allow to concisely express repetition of equal statements over many constant indices, and are thus equivalent to their rolled-out form given the data.","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"In the BUGS language the type information is fine grained: each component of a tensor can have different type information. […] One common case is where some components of a tensor have been observed while other components need to be estimated.","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"In addition to standard type checking of semantic consistency between variables and function calls, like any other expression-based language does, BUGS has the additional task of making sense of the indexed variables, which can occur in many places and arbitrary order, and ensuring that stochasticity is only used where it is allowed (e.g., not on the LHS of assignments, or within loop ranges).","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"A “type checker” for BUGS would therefore have multiple purposes:","category":"page"},{"location":"ast/","page":"AST Translation","title":"AST Translation","text":"Checking semantic constraints, such as correct argument types for functions and distributions,\nChecking stochasticity constraints, such as constantness of loop ranges,\nUnify types, ranks, and stochasticity of all variables – which can be specified in any order.","category":"page"},{"location":"array/#Array-Interface","page":"Array Interface","title":"Array Interface","text":"","category":"section"},{"location":"array/","page":"Array Interface","title":"Array Interface","text":"There are subtleties involved in using the array syntax of BUGS.  Two elements of the same array can be one logical variable and one stochastic variable. ","category":"page"},{"location":"array/#Size-Deduction","page":"Array Interface","title":"Size Deduction","text":"","category":"section"},{"location":"array/","page":"Array Interface","title":"Array Interface","text":"The size of data arrays will not be deducted.","category":"page"},{"location":"array/","page":"Array Interface","title":"Array Interface","text":"Otherwise, the array size will be deduced from the model definition. The unrolling will evaluate all the indices into concrete values (the exception is stochastic indexing).  We will treat the largest index as the size of the array for a specific dimension. ","category":"page"},{"location":"array/#Nested-Indexing","page":"Array Interface","title":"Nested Indexing","text":"","category":"section"},{"location":"array/","page":"Array Interface","title":"Array Interface","text":"Nested indexing can be the source of many errors, especially while data is involved.","category":"page"},{"location":"array/#Colon-Indexing","page":"Array Interface","title":"Colon Indexing","text":"","category":"section"},{"location":"array/","page":"Array Interface","title":"Array Interface","text":"Users should be cautious when using the colon indexing syntax.  Colon indexing requires knowledge of the size of the array.  If a loop bound requires a colon indexing, the potential size information from the loop body will not be concerned. ","category":"page"},{"location":"array/#Multivariate-Variables","page":"Array Interface","title":"Multivariate Variables","text":"","category":"section"},{"location":"#Introduction","page":"Introduction","title":"Introduction","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"SymbolicPPL is a graph-based probabilistic programming language and a component of the Turing ecosystem.  The package aims to support modelling and inference for probabilistic programs written in the BUGS language. ","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"This project is still in its very early stage, with many key components needing to be completed. ","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"Please refer to the Github project page for usage information and a complete example.","category":"page"},{"location":"inference/#Inference-Tests","page":"Inference Tests","title":"Inference Tests","text":"","category":"section"},{"location":"inference/","page":"Inference Tests","title":"Inference Tests","text":"Currently, we still need a reliable inference infrastructure.  Users can try compiling into a Turing.Model and use the existing inference algorithms.  Although please note that many models may not work well, we are working on building the tools and optimizing performance. ","category":"page"},{"location":"bugs_lang/#BUGS-Language-Reference-(Under-Construction)","page":"BUGS Language Reference","title":"BUGS Language Reference (Under Construction)","text":"","category":"section"},{"location":"bugs_lang/","page":"BUGS Language Reference","title":"BUGS Language Reference","text":"For now please refer to Model Specification.","category":"page"},{"location":"bugs_lang/#Notes-on-Modeling-with-BUGS","page":"BUGS Language Reference","title":"Notes on Modeling with BUGS","text":"","category":"section"},{"location":"bugs_lang/","page":"BUGS Language Reference","title":"BUGS Language Reference","text":"We encourage users of the BUGS language first construct a model on paper. ","category":"page"},{"location":"bugs_lang/","page":"BUGS Language Reference","title":"BUGS Language Reference","text":"Every stochastic variable corresponds to a node in the graph, and every tilde assignment corresponds to the node's incoming edges.  The compiler will eagerly replace all the logical variables with their corresponding assignment.  Thus the compiled graph only contains stochastic variables.","category":"page"},{"location":"bugs_lang/","page":"BUGS Language Reference","title":"BUGS Language Reference","text":"Users familiar with programming languages like Julia should be warned that BUGS's array and loop syntax differs from Julia's.  In BUGS, loops do not represent the control flow but a shorthand to write programs for the unrolled version of the program.","category":"page"}]
}
