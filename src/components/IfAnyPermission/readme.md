# IfAnyPermission

A wrapper component that facilitates conditional rendering based on
whether the currently authentiated user has _any_ of the permissions
named in the given comma-delimited string.

Supports children in the form of React nodes or as a render-prop function.

## Usage (children as nodes)

```
<IfAnyPermission perm="users.edit,users.manage">
  <button onClick={this.onClickEditUser}>Edit</button>
</IfAnyPermission>
```

## Usage (children as function)

```
<IfAnyPermission perm="users.edit,users.manage">
  {({ hasPermission }) => hasPermission ?
    <button onClick={this.onClickEditUser}>Edit</button>
    :
    <span>You do not have permission to edit this user!</span>
  }
</IfAnyPermission>
```

## Properties

A single property is supported:

* `perm`: a comma-delimited string of permissions to check.

