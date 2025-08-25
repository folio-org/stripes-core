# IfPermission

A wrapper component that facilitates conditional rendering based on
whether the currently authentiated user has _all_ the permissions
named in the given comma-delimited string.

Supports children in the form of React nodes or as a render-prop function.

## Usage (children as nodes)

```
<IfPermission perm="users.edit">
  <button onClick={this.onClickEditUser}>Edit</button>
</IfPermission>
```

## Usage (children as function)

```
<IfPermission perm="users.edit">
  {({ hasPermission }) => hasPermission ?
    <button onClick={this.onClickEditUser}>Edit</button>
    :
    <span>You do not have permission to edit this user!</span>
  }
</IfPermission>
```

## Properties

A single property is supported:

* `perm`: a comma-delimited string of permissions to check.
